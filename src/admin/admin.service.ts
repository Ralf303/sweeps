import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { StatsResponseDto } from './dto/stats.dto';

@Injectable()
export class AdminService extends UserService {
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
