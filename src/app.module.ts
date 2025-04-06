import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BannerModule } from './banners/banners.module';
import { SlotsModule } from './slots/slots.module';
import { CallbackModule } from './callback/callback.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, SlotsModule, BannerModule, CallbackModule],
})
export class AppModule {}
