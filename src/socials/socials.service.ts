import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocialLink } from '@prisma/client';

@Injectable()
export class SocialsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<SocialLink[]> {
    return this.prisma.socialLink.findMany();
  }

  async updateLink(id: number, url: string): Promise<SocialLink> {
    return this.prisma.socialLink.update({
      where: { id },
      data: { url },
    });
  }
}
