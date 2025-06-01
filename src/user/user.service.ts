import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from './dto/user.dto';
import { USER_SELECT_FIELDS } from './utils/user.select';
import { TransactionDto } from './dto/transaction.dto';

@Injectable()
export class UserService {
  constructor(protected readonly prisma: PrismaService) {}

  async markTransactionAsRefunded(transactionId: string) {
    return this.prisma.transaction.update({
      where: { transaction_id: transactionId },
      data: { refunded: true },
    });
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateBalance(id: string, amount: number) {
    if (amount < 0 || !Number.isFinite(amount)) {
      throw new BadRequestException('Invalid balance value');
    }
    return this.prisma.user.update({
      where: { id },
      data: { balance: amount },
    });
  }

  async updateDailyLose(id: string, amount: number) {
    if (amount < 0) {
      throw new BadRequestException('Daily lose cannot be negative');
    }
    return this.prisma.user.update({
      where: { id },
      data: { dailyLose: amount, globalLose: { increment: amount } },
    });
  }

  async getUserStats() {
    const [totalUsers, bannedUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isBanned: true } }),
    ]);

    return {
      totalUsers,
      bannedUsers,
    };
  }

  async findTransaction(transactionId: string) {
    return this.prisma.transaction.findUnique({
      where: { transaction_id: transactionId },
      select: {
        action: true,
        amount: true,
        refunded_amount: true,
        game_uuid: true,
        currency: true,
        rolled_back: true,
      },
    });
  }

  async saveTransaction(data: TransactionDto) {
    return this.prisma.transaction.create({
      data: {
        transaction_id: data.transaction_id,
        action: data.action,
        amount: data.amount,
        currency: data.currency || 'EUR',
        round_id: data.round_id,
        game_uuid: data.game_uuid,
        session_id: data.session_id,
        userId: data.player_id,
        bet_transaction_id: data.bet_transaction_id,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        profit: data.profit,
        gameName: data.gameName,
        bet: data.bet,
        gameAvatarUrl: data.imageUrl,
      },
    });
  }

  async markTransactionAsRolledBack(transactionId: string) {
    return this.prisma.transaction.update({
      where: { transaction_id: transactionId },
      data: { rolled_back: true },
    });
  }

  async getTransactionsForRollback(playerId: string, roundId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId: playerId,
        round_id: roundId,
        rolled_back: false,
        action: { in: ['bet', 'win'] },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async updateRefundedAmount(transactionId: string, amount: number) {
    return this.prisma.transaction.update({
      where: { transaction_id: transactionId },
      data: {
        refunded_amount: { increment: amount },
        refunded: true,
      },
    });
  }

  async markTransactionsAsRolledBack(transactionIds: string[]) {
    return this.prisma.transaction.updateMany({
      where: {
        transaction_id: { in: transactionIds },
      },
      data: {
        rolled_back: true,
        refunded_amount: 0,
      },
    });
  }

  async getCurrentGameBalance(playerId: string, gameUuid: string) {
    const aggregations = await this.prisma.transaction.aggregate({
      where: {
        userId: playerId,
        game_uuid: gameUuid,
        rolled_back: false,
      },
      _sum: {
        amount: true,
      },
    });

    return aggregations._sum.amount || 0;
  }

  async uploadAvatar(userId: string, file: { filename: string }) {
    if (!file) throw new Error('Image is required');
    const imageUrl = `/uploads/avatars/${file.filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: imageUrl },
      select: USER_SELECT_FIELDS,
    });

    return updatedUser;
  }
}
