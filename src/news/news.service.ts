import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { unlink } from 'fs/promises';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async createNews(data: any, file: { filename: any }) {
    if (!file) throw new Error('Image is required');

    const imageUrl = `/uploads/news/${file.filename}`;

    return this.prisma.news.create({
      data: {
        ...data,
        imageUrl,
      },
    });
  }

  async getAllNews() {
    return this.prisma.news.findMany();
  }

  async searchNews(query: string) {
    return this.prisma.news.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getNewsById(id: string) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('News not found');

    return news;
  }

  async deleteNews(id: string) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) throw new NotFoundException('News not found');

    await this.prisma.news.delete({ where: { id } });

    await unlink(`.${news.imageUrl}`).catch(() => {});

    return { message: 'News deleted successfully' };
  }
}
