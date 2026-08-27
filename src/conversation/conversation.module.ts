import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { RagModule } from '../rag/rag.module';
import { LlmModule } from '../llm/llm.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [RagModule, LlmModule, ProductsModule, OrdersModule, NotificationsModule],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}