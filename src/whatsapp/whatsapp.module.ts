import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappClientModule } from './whatsapp-client.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [WhatsappClientModule, ConversationModule],
  controllers: [WhatsappController],
})
export class WhatsappModule {}