import { Module } from '@nestjs/common';
import { SocialsService } from './socials.service';
import { SocialsController } from './socials.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SocialsController],
  providers: [SocialsService, PrismaService],
})
export class SocialsModule {}
