import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  private readonly LIMIT = 100;

  constructor(private prisma: PrismaService) {}

  async getLeaderboardByMaxX(offset = 0) {
    return this.prisma.transaction.findMany({
      where: {
        action: 'win',
      },
      orderBy: { profit: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        user: { select: { id: true, nickname: true } },
        game_uuid: true,
        created_at: true,
        profit: true,
        bet: true,
        gameName: true,
      },
    });
  }

  async getUserReferralsStats(userId: string, offset = 0) {
    return this.prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { globalLose: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        id: true,
        nickname: true,
        globalLose: true,
      },
    });
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

  async getGameHistory(userId: string, offset = 0) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: { created_at: 'desc' },
      take: this.LIMIT,
      skip: offset,
      select: {
        game_uuid: true,
        created_at: true,
        balanceBefore: true,
        balanceAfter: true,
        profit: true,
        bet: true,
        gameName: true,
        bet_transaction: {
          select: { amount: true },
        },
      },
    });
  }
}
