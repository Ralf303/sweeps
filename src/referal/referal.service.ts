import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReferalService {
  private readonly logger = new Logger(ReferalService.name);

  private getCommissionRate(level: number): number {
    if (level >= 25) return 0.06;
    if (level >= 20) return 0.05;
    if (level >= 15) return 0.04;
    if (level >= 10) return 0.03;
    if (level >= 5) return 0.02;
    return 0.01;
  }

  private getLevelByTotalLose(total: number): number {
    const thresholds = [
      5_000, 10_000, 20_000, 40_000, 70_000, 110_000, 160_000, 220_000, 290_000,
      500_000, 1_000_000, 2_000_000, 3_000_000, 5_000_000, 7_000_000, 9_000_000,
      11_000_000, 13_000_000, 15_000_000, 18_000_000, 21_000_000, 24_000_000,
      27_000_000, 30_000_000, 34_000_000, 38_000_000, 42_000_000, 45_000_000,
      49_000_000, 54_000_000,
    ];
    for (let i = 0; i < thresholds.length; i++) {
      if (total < thresholds[i]) {
        return i + 1;
      }
    }
    return thresholds.length + 1;
  }

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 1 * * *', { timeZone: 'Europe/Berlin' })
  async handleDailyReferralPayouts() {
    this.logger.debug('Начинаем выплату реферальных комиссий');

    const losers = await this.prisma.user.findMany({
      where: {
        dailyLose: { gt: 0 },
        referredById: { not: null },
      },
      select: { id: true, dailyLose: true, referredById: true },
    });

    for (const { id: userId, dailyLose, referredById } of losers) {
      const referrer = await this.prisma.user.findUnique({
        where: { id: referredById },
        select: {
          id: true,
          referralAllLose: true,
          referralLevel: true,
          balance: true,
        },
      });
      if (!referrer) continue;

      const rate = this.getCommissionRate(referrer.referralLevel);
      const payout = dailyLose * rate;
      const newTotalLose = referrer.referralAllLose + dailyLose;
      const newLevel = this.getLevelByTotalLose(newTotalLose);

      await this.prisma.user.update({
        where: { id: referrer.id },
        data: {
          balance: { increment: payout },
          referralAllLose: newTotalLose,
          referralLevel: newLevel,
          refPercentage: rate * 100,
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dailyLose: 0,
          weeklyLose: { increment: dailyLose },
          monthlyLose: { increment: dailyLose },
        },
      });

      this.logger.log(
        `User ${userId} lost ${dailyLose}, paid ${payout.toFixed(2)} to ${referrer.id}, new level ${newLevel}`,
      );
    }

    this.logger.debug('Завершили выплату реферальных комиссий');
  }

  @Cron('5 1 * * 1', { timeZone: 'Europe/Berlin' })
  async resetWeeklyLose() {
    await this.prisma.user.updateMany({ data: { weeklyLose: 0 } });
    this.logger.log('Сбросили weeklyLose для всех пользователей');
  }

  @Cron('10 1 1 * *', { timeZone: 'Europe/Berlin' })
  async resetMonthlyLose() {
    await this.prisma.user.updateMany({ data: { monthlyLose: 0 } });
    this.logger.log('Сбросили monthlyLose для всех пользователей');
  }
}
