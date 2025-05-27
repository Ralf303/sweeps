import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(
    userId: string,
    date: string,
    amount: string,
    previous: number,
    next: number,
  ) {
    return this.prisma.log.create({
      data: { userId, date, amount, previous, new: next },
    });
  }

  async getAllLogs(pagination: PaginationDto) {
    const { start = 0 } = pagination;
    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        skip: Number(start),
        take: 100,
        orderBy: { date: 'desc' },
      }),
      this.prisma.log.count(),
    ]);
    return { data, total, start };
  }

  async getUserLogs(userId: string, pagination: PaginationDto) {
    const { start = 0 } = pagination;
    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        where: { userId },
        skip: Number(start),
        take: 100,
        orderBy: { date: 'desc' },
      }),
      this.prisma.log.count({ where: { userId } }),
    ]);
    return { data, total, start };
  }
}
