import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [LogsController],
  providers: [LogsService, PrismaService, JwtService],
  exports: [LogsService],
})
export class LogsModule {}
