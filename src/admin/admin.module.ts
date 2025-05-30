import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LogsService } from 'src/adminLogger/logs.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, JwtService, LogsService],
})
export class AdminModule {}
