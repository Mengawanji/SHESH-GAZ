import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RetrievalService } from '../rag/retrieval.service';
import { LlmService, ChatMessage } from '../llm/llm.service';
import { buildSystemPrompt } from '../llm/tools';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConversationState, OrderContext } from './conversation-state';

const MAX_TOOL_ITERATIONS = 4;
const HISTORY_LIMIT = 12;

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieval: RetrievalService,
    private readonly llm: LlmService,
    private readonly products: ProductsService,
    private readonly notifications: NotificationsService,
  ) {}

  async handleIncomingMessage(customerPhone: string, text: string): Promise<string | null> {
    const conversation = await this.getOrCreateConversation(customerPhone);

    if (conversation.humanTakeover) {
      await this.saveMessage(conversation.id, 'user', text);
      return null;
    }

    await this.saveMessage(conversation.id, 'user', text);

    const ragChunks = await this.retrieval.retrieve(text);
    const ragContext = this.retrieval.formatAsContext(ragChunks);
    const context = (conversation.context as OrderContext) ?? {};

    const history = await this.getRecentHistory(conversation.id);
    const systemPrompt = buildSystemPrompt(conversation.state, context, ragContext);

    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...history];

    const { replyText, updatedContext, updatedState } = await this.runToolLoop(
      messages,
      conversation.id,
      customerPhone,
      context,
    );

    await this.saveMessage(conversation.id, 'assistant', replyText);
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { context: updatedContext as any, state: updatedState },
    });

    return replyText;
  }

  private async runToolLoop(
    messages: ChatMessage[],
    conversationId: number,
    customerPhone: string,
    context: OrderContext,
  ): Promise<{ replyText: string; updatedContext: OrderContext; updatedState: string }> {
    let state = ConversationState.BROWSING;
    let workingContext = { ...context };

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const message = await this.llm.chat(messages);

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return {
          replyText: message.content ?? "Sorry, could you say that again?",
          updatedContext: workingContext,
          updatedState: state,
        };
      }

      messages.push({ role: 'assistant', content: message.content ?? '', tool_calls: message.tool_calls });

      for (const call of message.tool_calls) {
        const args = JSON.parse(call.function.arguments || '{}');
        const result = await this.executeTool(call.function.name, args, conversationId, customerPhone);
        const escalated = Boolean((result as { escalated?: boolean })?.escalated);

        if (call.function.name === 'createOrder') {
          workingContext = { ...workingContext, ...args };
          if (escalated) state = ConversationState.ESCALATED;
        } else if (call.function.name === 'escalateToHuman' || escalated) {
          state = ConversationState.ESCALATED;
        } else if (call.function.name === 'checkAvailability') {
          workingContext = {
            ...workingContext,
            brand: args.brand,
            ...(args.size ? { size: args.size } : {}),
          };
          state = ConversationState.BROWSING;
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      replyText: "Let me get that checked and I'll get right back to you.",
      updatedContext: workingContext,
      updatedState: state,
    };
  }

  private async executeTool(
    name: string,
    args: any,
    conversationId: number,
    customerPhone: string,
  ): Promise<unknown> {
    switch (name) {
      case 'checkAvailability': {
        const result = await this.products.checkAvailability(args.brand, args.size);
        if (args.size && result.found && result.available) {
          await this.escalate(
            conversationId,
            customerPhone,
            `Customer wants ${args.brand} ${args.size} (in stock)`,
          );
          return {
            ...result,
            escalated: true,
            message: `${args.brand} ${args.size} is available. A team member will take over this chat.`,
          };
        }
        if (args.size && result.found && !result.available) {
          return {
            ...result,
            escalated: false,
            message: `${args.brand} ${args.size} is currently unavailable.`,
          };
        }
        return { ...result, escalated: false };
      }

      case 'createOrder': {
        const availability = await this.products.checkAvailability(args.brand, args.size);
        if (!availability.found || !availability.available) {
          return {
            created: false,
            available: false,
            escalated: false,
            message: availability.found
              ? `${args.brand} ${args.size} is currently unavailable. Do not place an order.`
              : availability.message,
          };
        }

        await this.escalate(
          conversationId,
          customerPhone,
          `Customer wants ${args.brand} ${args.size} (in stock)`,
        );
        return {
          created: false,
          available: true,
          escalated: true,
          message: 'This sale is handed to a human agent. Do not create an order.',
        };
      }

      case 'escalateToHuman':
        await this.escalate(conversationId, customerPhone, args.reason);
        return { escalated: true };

      default:
        this.logger.warn(`Unknown tool call: ${name}`);
        return { error: `Unknown tool: ${name}` };
    }
  }

  private async escalate(conversationId: number, customerPhone: string, reason: string) {
    const updated = await this.prisma.conversation.updateMany({
      where: { id: conversationId, humanTakeover: false },
      data: { humanTakeover: true },
    });

    if (updated.count > 0) {
      await this.notifications.notifyEscalation(customerPhone, reason);
    }
  }

  private async getOrCreateConversation(customerPhone: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { customerPhone },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { customerPhone, state: ConversationState.GREETING, context: {} },
    });
  }

  private async saveMessage(conversationId: number, role: 'user' | 'assistant', content: string) {
    await this.prisma.message.create({ data: { conversationId, role, content } });
  }

  private async getRecentHistory(conversationId: number): Promise<ChatMessage[]> {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    });
    return rows
      .reverse()
      .map((r) => ({ role: r.role as 'user' | 'assistant', content: r.content }));
  }
}
