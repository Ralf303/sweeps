import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: string): Promise<User | { balance: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return { balance: 0 };
    return user;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async banUser(id: string) {
    const user = await this.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { isBanned: true } });
  }

  async unbanUser(id: string) {
    const user = await this.getUserById(id);
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
    if (amount < 0) {
      throw new BadRequestException('Balance cannot be negative');
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
}
