import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BannerModule } from './banners/banners.module';
import { SlotsModule } from './slots/slots.module';
import { NewsModule } from './news/news.module';
import { FaqModule } from './faq/faq.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, SlotsModule, BannerModule, NewsModule, FaqModule, ChatModule],
})
export class AppModule {}
