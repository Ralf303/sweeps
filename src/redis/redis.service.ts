import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    });
  }

  async setInvoice(foreignId: string, data: any, ttlSeconds = 1200) {
    await this.redis.setex(
      `invoice:${foreignId}`,
      ttlSeconds,
      JSON.stringify(data),
    );
  }

  async getInvoice(foreignId: string): Promise<any | null> {
    const value = await this.redis.get(`invoice:${foreignId}`);
    return value ? JSON.parse(value) : null;
  }

  async deleteInvoice(foreignId: string) {
    await this.redis.del(`invoice:${foreignId}`);
  }
}
