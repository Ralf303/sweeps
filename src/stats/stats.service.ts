import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { fieldMap, Period, PeriodMap } from 'src/slots/types/period';

@Injectable()
export class StatsService {
  private readonly LIMIT = 100;

  constructor(private prisma: PrismaService) {}

  async getLeaderboardByMaxX(offset = 0, period: Period = 'global') {
    const now = new Date();
    let dateFrom: Date | undefined;

    switch (period) {
      case PeriodMap.daily:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case PeriodMap.weekly:
        const day = now.getDay();
        dateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - day,
        );
        break;
      case PeriodMap.monthly:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case PeriodMap.global:
      default:
        dateFrom = undefined;
        break;
    }

    const where: any = { action: 'win' };
    if (dateFrom) {
      where.created_at = { gte: dateFrom };
    }

    return this.prisma.transaction.findMany({
      where,
      distinct: ['userId'],
      orderBy: { profit: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        game_uuid: true,
        gameName: true,
        gameAvatarUrl: true,
        created_at: true,
        profit: true,
        bet: true,
      },
    });
  }

  async getUserReferralsStats(
    userId: string,
    offset = 0,
    period: Period = 'global',
  ) {
    const orderByField = fieldMap[period];

    const referals = await this.prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { [orderByField]: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        id: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        [orderByField]: true,
      },
    });

    return referals.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
      createdAt: u.createdAt,
      statsValue: u[orderByField],
    }));
  }

  async getCryptoHistory(userId: string, offset = 0) {
    return this.prisma.crypto.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        id: true,
        currency: true,
        amount: true,
        status: true,
        createdAt: true,
        senderAmount: true,
        senderCurrency: true,
        rawData: false,
      },
    });
  }

  async getGameHistory(userId: string, offset = 0, period: Period = 'global') {
    const now = new Date();
    let dateFrom: Date | undefined;

    switch (period) {
      case PeriodMap.daily:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case PeriodMap.weekly:
        {
          const diff = now.getDay();
          dateFrom = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - diff,
          );
        }
        break;
      case PeriodMap.monthly:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case PeriodMap.global:
      default:
        dateFrom = undefined;
    }

    const where: any = { userId };
    if (dateFrom) {
      where.created_at = { gte: dateFrom };
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        game_uuid: true,
        gameAvatarUrl: true,
        created_at: true,
        balanceBefore: true,
        bet: true,
        profit: true,
        balanceAfter: true,
        gameName: true,
        bet_transaction: {
          select: { amount: true },
        },
      },
    });
  }
}
