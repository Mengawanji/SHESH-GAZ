import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConversationModule } from './conversation/conversation.module';
import { LegalModule } from './legal/legal.module';
import { LegalController } from './legal/legal.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    WhatsappModule,
    ProductsModule,
    OrdersModule,
    NotificationsModule,
    ConversationModule,
    LegalModule,
  ],
  controllers: [AppController, LegalController],
  providers: [AppService],
})
export class AppModule {}