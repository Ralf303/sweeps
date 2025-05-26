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
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.log.count(),
    ]);
    return { data, total, page, limit };
  }

  async getUserLogs(userId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.log.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.log.count({ where: { userId } }),
    ]);
    return { data, total, page, limit };
  }
}
