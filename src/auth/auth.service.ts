import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  public async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id, email: user.email, nickname: user.nickname };
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
}
