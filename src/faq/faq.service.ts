import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async createFaq(data: any) {
    return this.prisma.faq.create({
      data,
    });
  }

  async getAllFaq() {
    return this.prisma.faq.findMany();
  }

  async deleteFaq(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('Faq not found');

    await this.prisma.faq.delete({ where: { id } });

    return { message: 'Faq deleted successfully' };
  }
}
