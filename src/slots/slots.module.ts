import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SlotsController } from './slots.controller';
import { SlotegratorService } from './services/slotegrator.service';
import { SignatureService } from './services/signature.service';
import { CallbackService } from './services/callback.service';

@Module({
  imports: [HttpModule],
  controllers: [SlotsController],
  providers: [SlotegratorService, SignatureService, CallbackService],
})
export class SlotsModule {}
