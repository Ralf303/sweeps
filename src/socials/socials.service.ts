import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialsService {
  constructor(private readonly prisma: PrismaService) {}

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
    return this.prisma.socialLink.update({
      where: { id },
      data: { image: iconPath },
    });
  }
}
