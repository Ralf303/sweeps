import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CryptoController],
  providers: [CryptoService, RedisService, JwtService],
})
export class CryptoModule {}
