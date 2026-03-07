import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

const EXCHANGE = 'registration.events';
const ROUTING_KEYS = {
  enrolled: 'registration.enrolled',
  cancelled: 'registration.cancelled',
  failedFull: 'registration.failed_full',
  failedConflict: 'registration.failed_conflict',
} as const;

export interface EnrolledPayload {
  userId: string;
  studentId: string;
  email?: string;
  fullName?: string;
  classIds: string[];
  classDetails: { classCode: string; courseName: string }[];
}

export interface CancelledPayload {
  userId: string;
  studentId: string;
  email?: string;
  fullName?: string;
  enrollmentId: string;
  classCode: string;
  courseName: string;
}

export interface FailedPayload {
  userId: string;
  studentId: string;
  email?: string;
  reason: 'class_full' | 'schedule_conflict';
  classIds?: string[];
  message: string;
}

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: amqp.Channel | null = null;

  async onModuleInit() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://uit:uit_secret@localhost:5672';
      const conn = await amqp.connect(url);
      this.connection = conn;
      this.channel = await (conn as unknown as { createChannel(): Promise<amqp.Channel> }).createChannel();
      await this.channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    } catch (err) {
      console.warn('RabbitMQ connection failed; events will not be published:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await (this.connection as unknown as { close(): Promise<void> }).close();
  }

  private async publish(routingKey: string, payload: object) {
    if (!this.channel) return;
    this.channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }

  async publishEnrolled(payload: EnrolledPayload) {
    await this.publish(ROUTING_KEYS.enrolled, payload);
  }

  async publishCancelled(payload: CancelledPayload) {
    await this.publish(ROUTING_KEYS.cancelled, payload);
  }

  async publishFailedFull(payload: FailedPayload) {
    await this.publish(ROUTING_KEYS.failedFull, payload);
  }

  async publishFailedConflict(payload: FailedPayload) {
    await this.publish(ROUTING_KEYS.failedConflict, payload);
  }
}
