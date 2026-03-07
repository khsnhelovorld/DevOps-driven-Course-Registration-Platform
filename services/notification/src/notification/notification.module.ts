import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { RabbitMQConsumerService } from './rabbitmq-consumer.service';

@Module({
  providers: [MailService, RabbitMQConsumerService],
})
export class NotificationModule {}
