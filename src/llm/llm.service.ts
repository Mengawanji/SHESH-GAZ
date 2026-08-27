import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { TOOL_DEFINITIONS } from './tools';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
  name?: string;
}

@Injectable()
export class LlmService {
  private readonly groq: Groq;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.groq = new Groq({ apiKey: this.config.get<string>('GROQ_API_KEY') });
    this.model = this.config.get<string>('GROQ_MODEL', 'llama-3.3-70b-versatile');
  }

  async chat(messages: ChatMessage[]) {
    const completion = await this.groq.chat.completions.create({
      model: this.model,
      messages: messages as any,
      tools: TOOL_DEFINITIONS as any,
      tool_choice: 'auto',
      temperature: 0.4,
    });

    return completion.choices[0].message;
  }
}