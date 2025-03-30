import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { BannerController } from './banners.controller';
import { BannerService } from './banners.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/banners',
    }),
  ],
  controllers: [BannerController],
  providers: [BannerService, PrismaService, JwtService],
})
export class BannerModule {}
