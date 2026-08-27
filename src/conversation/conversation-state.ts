export enum ConversationState {
  GREETING = 'greeting',
  BROWSING = 'browsing',
  COLLECTING_QUANTITY = 'collecting_quantity',
  COLLECTING_DELIVERY = 'collecting_delivery',
  CONFIRMING_ORDER = 'confirming_order',
  ORDER_PLACED = 'order_placed',
  ESCALATED = 'escalated',
}

export interface OrderContext {
  brand?: string;
  size?: string;
  quantity?: number;
  deliveryType?: 'delivery' | 'pickup';
  address?: string;
}