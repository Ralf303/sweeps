import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatsResponseDto } from './dto/stats.dto';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(): Promise<StatsResponseDto> {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(new Date().setDate(now.getDate() - 7));
    const startOfMonth = new Date(new Date().setDate(now.getDate() - 30));

    const [
      totalUsers,
      bannedUsers,
      todayUsers,
      weekUsers,
      monthUsers,
      totalDeposits,
      todayDeposits,
      weekDeposits,
      monthDeposits,
      totalBalances,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.crypto.aggregate({
        _sum: { amount: true },
        where: {
          status: 'confirmed',
        },
      }),
      this.prisma.crypto.aggregate({
        _sum: { amount: true },
        where: {
          status: 'confirmed',

          createdAt: { gte: startOfToday },
        },
      }),
      this.prisma.crypto.aggregate({
        _sum: { amount: true },
        where: {
          status: 'confirmed',

          createdAt: { gte: startOfWeek },
        },
      }),
      this.prisma.crypto.aggregate({
        _sum: { amount: true },
        where: {
          status: 'confirmed',

          createdAt: { gte: startOfMonth },
        },
      }),
      this.prisma.user.aggregate({
        _sum: { balance: true },
      }),
    ]);

    return {
      totalUsers,
      bannedUsers,
      todayUsers,
      weekUsers,
      monthUsers,
      todayDeposits: todayDeposits._sum.amount || 0,
      weekDeposits: weekDeposits._sum.amount || 0,
      monthDeposits: monthDeposits._sum.amount || 0,
      totalDeposits: totalDeposits._sum.amount || 0,
      totalBalances: totalBalances._sum.balance || 0,
    };
  }
}
