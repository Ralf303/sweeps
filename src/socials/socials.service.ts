import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SocialsService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly iconDir = '/var/www/uploads/icons';

  async getAll(): Promise<any> {
    return this.prisma.socialLink.findMany();
  }

  async updateLink(id: number, url: string): Promise<any> {
    return this.prisma.socialLink.update({
      where: { id },
      data: { url },
    });
  }

  async updateTitle(id: number, platform: string): Promise<any> {
    return this.prisma.socialLink.update({
      where: { id },
      data: { platform },
    });
  }

  async updateIcon(id: number, iconPath: string): Promise<any> {
    const social = await this.prisma.socialLink.findUnique({
      where: { id },
    });

    if (social.image) {
      const oldPath = join(this.iconDir, social.image);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    return this.prisma.socialLink.update({
      where: { id },
      data: { image: iconPath },
    });
  }
}
