import { Module } from '@nestjs/common';
import { ReferalService } from './referal.service';
import { ReferalController } from './referal.controller';

@Module({
  controllers: [ReferalController],
  providers: [ReferalService],
})
export class ReferalModule {}
