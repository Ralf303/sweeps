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

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        nickname: true,
        referralCode: true,
        referralsCount: true,
        balance: true,
        isBanned: true,
        role: true,
        referralLevel: true,
        referrals: true,
      },
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
}
