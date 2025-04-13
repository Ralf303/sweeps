import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({
      dest: '/var/www/uploads/news/',
    }),
  ],
  controllers: [NewsController],
  providers: [NewsService, PrismaService, JwtService],
})
export class NewsModule {}
