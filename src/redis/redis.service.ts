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

  async setGameMode(playerId: string, gameMode: string, ttlSeconds = 3600) {
    await this.redis.setex(`game_mode:${playerId}`, ttlSeconds, gameMode);
  }

  async getGameMode(playerId: string): Promise<string | null> {
    return this.redis.get(`game_mode:${playerId}`);
  }

  async setNotificationFlag(playerId: string, ttlSeconds = 5) {
    await this.redis.setex(`notification_flag:${playerId}`, ttlSeconds, '1');
  }

  async checkNotificationFlag(playerId: string): Promise<boolean> {
    return (await this.redis.exists(`notification_flag:${playerId}`)) === 1;
  }
}
