import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SlotsModule } from './slots/slots.module';
import { BannerModule } from './banners/banners.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, SlotsModule, BannerModule],
})
export class AppModule {}
