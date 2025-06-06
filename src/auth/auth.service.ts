import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ValidateDto } from './dto/auth.dto';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private redis: RedisService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateReferralCode(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async getUniqueReferralCode(): Promise<string> {
    let referralCode: string;
    let exists: boolean;

    do {
      referralCode = this.generateReferralCode();
      exists = !!(await this.prisma.user.findUnique({
        where: { referralCode },
      }));
    } while (exists);

    return referralCode;
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<ValidateDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      balance: user.balance,
      referralsCount: user.referralsCount,
      referralCode: user.referralCode,
      referralAllLose: user.referralAllLose,
      isBanned: user.isBanned,
    };
  }

  public async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return {
      access_token: this.jwtService.sign(user),
    };
  }

  public async register(
    email: string,
    password: string,
    nickname: string,
    referralCode?: string,
  ) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { nickname }],
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email or nickname already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let referredById: string | null = null;

    if (referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referredById = referrer.id;

        await this.prisma.user.update({
          where: { id: referrer.id },
          data: { referralsCount: { increment: 1 } },
        });
      }
    }

    const newReferralCode = await this.getUniqueReferralCode();

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        referredById,
        referralCode: newReferralCode,
      },
    });

    return this.login(user.email, password);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Пользователь не найден');

    const code = this.generateCode();
    await this.redis.setInvoice(`forgot:${email}`, code, 900);
    await this.mailService.sendResetCode(email, code);

    return { message: 'Код отправлен на email' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const stored = await this.redis.getInvoice(`forgot:${email}`);
    if (stored !== code) throw new BadRequestException('Неверный код');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { password: hash },
    });
    await this.redis.deleteInvoice(`forgot:${email}`);

    return { message: 'Пароль успешно обновлён' };
  }
}
