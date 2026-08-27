import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { WhatsappClientModule } from '../whatsapp/whatsapp-client.module';

@Module({
  imports: [WhatsappClientModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}