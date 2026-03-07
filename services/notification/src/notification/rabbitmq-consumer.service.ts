import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { MailService } from './mail.service';

const EXCHANGE = 'registration.events';
const QUEUE = 'notification.registration';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

@Injectable()
export class RabbitMQConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly mail: MailService) {}

  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://uit:uit_secret@localhost:5672';
      const conn = await amqp.connect(url);
      this.connection = conn;
      const ch = await (conn as unknown as { createChannel(): Promise<amqp.Channel> }).createChannel();
      this.channel = ch;
      await ch.assertExchange(EXCHANGE, 'topic', { durable: true });
      await ch.assertQueue(QUEUE, { durable: true });
      await ch.bindQueue(QUEUE, EXCHANGE, 'registration.enrolled');
      await ch.bindQueue(QUEUE, EXCHANGE, 'registration.cancelled');
      await ch.bindQueue(QUEUE, EXCHANGE, 'registration.failed_full');
      await ch.bindQueue(QUEUE, EXCHANGE, 'registration.failed_conflict');
      await ch.consume(QUEUE, (msg) => this.handleMessage(msg), { noAck: false });
    } catch (err) {
      console.warn('RabbitMQ consumer failed:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await (this.connection as unknown as { close(): Promise<void> }).close();
  }

  private async handleMessage(msg: amqp.ConsumeMessage | null) {
    if (!msg || !this.channel) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;
      if (routingKey === 'registration.enrolled' && payload.email) {
        await this.mail.sendEnrolledEmail(
          payload.email,
          payload.fullName ?? 'Sinh viên',
          payload.classDetails ?? [],
        );
      } else if (routingKey === 'registration.cancelled' && payload.email) {
        await this.mail.sendCancelledEmail(
          payload.email,
          payload.fullName ?? 'Sinh viên',
          payload.classCode ?? '',
          payload.courseName ?? '',
        );
      }
      this.channel.ack(msg);
    } catch (err) {
      console.error('Notification handle error:', err);
      this.channel.nack(msg, false, true);
    }
  }
}
