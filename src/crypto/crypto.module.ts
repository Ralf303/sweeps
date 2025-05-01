import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [CryptoController],
  providers: [CryptoService, RedisService],
})
export class CryptoModule {}
