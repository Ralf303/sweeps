import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PageService {
  private readonly iconDir = '/var/www/uploads/icons';

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.page.findMany();
  }

  async update(id: number, dto: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    return this.prisma.page.update({
      where: { id },
      data: {
        value: dto ?? page.value,
      },
    });
  }

  async updateIcon(id: number, filename: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');

    if (page.value) {
      const oldPath = join(this.iconDir, page.value);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }

    return this.prisma.page.update({
      where: { id },
      data: { value: filename },
    });
  }
}
