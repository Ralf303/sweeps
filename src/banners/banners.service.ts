import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs/promises';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  async createBanner(data: any, file: { filename: any }) {
    if (!file) throw new Error('Image is required');

    const imageUrl = `/uploads/banners/${file.filename}`;

    return this.prisma.banner.create({
      data: {
        ...data,
        imageUrl,
      },
    });
  }

  async getAllBanners() {
    return this.prisma.banner.findMany();
  }

  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });

    await unlink(`.${banner.imageUrl}`).catch(() => {});

    return { message: 'Banner deleted successfully' };
  }
}
