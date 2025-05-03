import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SlotsController } from './slots.controller';
import { SlotegratorService } from './services/slotegrator.service';
import { SignatureService } from './services/signature.service';
import { CallbackService } from './services/callback.service';
import { UserService } from 'src/user/user.service';
import { LiveGateway } from 'src/live/live.gateway';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [HttpModule],
  controllers: [SlotsController],
  providers: [
    SlotegratorService,
    SignatureService,
    CallbackService,
    UserService,
    RedisService,
    LiveGateway,
  ],
})
export class SlotsModule {}
