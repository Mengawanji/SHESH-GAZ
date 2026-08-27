import { Body, Controller, Get, HttpCode, Logger, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { ConversationService } from '../conversation/conversation.service';

@Controller('whatsapp/webhook')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly whatsapp: WhatsappService,
    private readonly conversation: ConversationService,
  ) {}

  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const expected = this.config.get<string>('WHATSAPP_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === expected) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  @Post()
  @HttpCode(200)
  async receive(@Body() payload: any) {
    try {
      const entry = payload?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (!message || message.type !== 'text') {
        return { received: true };
      }

      const fromPhone: string = message.from;
      const text: string = message.text?.body ?? '';

      const reply = await this.conversation.handleIncomingMessage(fromPhone, text);
      if (reply) {
        await this.whatsapp.sendText(fromPhone, reply);
      }
    } catch (err) {
      this.logger.error('Failed to process inbound WhatsApp message', err as Error);
    }
    return { received: true };
  }
}