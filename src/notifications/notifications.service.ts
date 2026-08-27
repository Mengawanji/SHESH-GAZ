import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class NotificationsService {
  private readonly supplierPhone: string;

  constructor(
    private readonly config: ConfigService,
    private readonly whatsapp: WhatsappService,
  ) {
    this.supplierPhone = this.config.get<string>('SUPPLIER_PHONE_NUMBER', '');
  }

  async notifyNewOrder(order: {
    orderId: number;
    brand: string;
    size: string;
    quantity: number;
    total: number | null;
    deliveryType: string;
    address: string | null;
    customerPhone: string;
  }) {
    const lines = [
      `🧾 New order #${order.orderId}`,
      `${order.brand} ${order.size} x${order.quantity}`,
      order.total ? `Total: ${order.total}` : null,
      `${order.deliveryType === 'delivery' ? `Deliver to: ${order.address}` : 'Pickup'}`,
      `Customer: ${order.customerPhone}`,
    ].filter(Boolean);

    await this.whatsapp.sendText(this.supplierPhone, lines.join('\n'));
  }

  async notifyEscalation(customerPhone: string, reason: string) {
    await this.whatsapp.sendText(
      this.supplierPhone,
      `⚠️ Conversation with ${customerPhone} needs you.\nReason: ${reason}`,
    );
  }
}