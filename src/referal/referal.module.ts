import { Module } from '@nestjs/common';
import { ReferalService } from './referal.service';
import { ReferalController } from './referal.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [PrismaService],
  controllers: [ReferalController],
  providers: [ReferalService],
})
export class ReferalModule {}
