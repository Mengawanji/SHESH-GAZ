import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl: string;
  private readonly accessToken: string;

  constructor(private readonly config: ConfigService) {
    const version = this.config.get<string>('WHATSAPP_API_VERSION', 'v20.0');
    const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.accessToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN', '');
    this.baseUrl = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
  }

  async sendText(toPhone: string, body: string): Promise<void> {
    try {
      await axios.post(
        this.baseUrl,
        {
          messaging_product: 'whatsapp',
          to: toPhone,
          type: 'text',
          text: { body },
        },
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );
    } catch (err: any) {
      this.logger.error(`Failed to send WhatsApp message to ${toPhone}`, err?.response?.data ?? err);
      throw err;
    }
  }
}