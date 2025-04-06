import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SlotsController } from './slots.controller';
import { SlotegratorService } from './services/slotegrator.service';
import { SignatureService } from './services/signature.service';
import { CallbackService } from './services/callback.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [HttpModule],
  controllers: [SlotsController],
  providers: [
    SlotegratorService,
    SignatureService,
    CallbackService,
    UserService,
  ],
})
export class SlotsModule {}
