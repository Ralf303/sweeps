import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async markTransactionAsRefunded(transactionId: string) {
    return this.prisma.transaction.update({
      where: { transaction_id: transactionId },
      data: { refunded: true },
    });
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async banUser(id: string) {
    const user = await this.getCurrentUser(id);
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { isBanned: true } });
  }

  async unbanUser(id: string) {
    const user = await this.getCurrentUser(id);
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: false },
    });
  }

  async updateUser(
    id: string,
    updateUserDto: { nickname?: string; password?: string },
  ) {
    const { nickname, password } = updateUserDto;
    if (!nickname && !password) {
      throw new BadRequestException('Nothing to update');
    }

    const updateData: any = {};
    if (nickname) updateData.nickname = nickname;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
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
      data: { dailyLose: amount },
    });
  }

  async getUsers(options: { startIndex?: number; isBanned?: boolean }) {
    const take = 100;
    const skip = options.startIndex || 0;

    return this.prisma.user.findMany({
      skip,
      take,
      where: options.isBanned ? { isBanned: true } : undefined,
      orderBy: { createdAt: 'desc' },
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
    });
  }

  async saveTransaction(data: {
    player_id: string;
    transaction_id: string;
    action: string;
    amount: number;
    currency?: string;
    round_id?: string;
    game_uuid?: string;
    session_id?: string;
    bet_transaction_id?: string;
  }) {
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
      },
    });
  }
}
