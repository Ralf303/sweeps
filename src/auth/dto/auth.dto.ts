import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'newuser@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'securePass123', description: 'User password' })
  password: string;

  @ApiProperty({ example: 'NewUser', description: 'User nickname' })
  nickname: string;

  @ApiProperty({
    example: 'ABCDEF',
    description: 'Referral code (optional)',
    required: false,
  })
  referralCode?: string;
}

export class ValidateDto {
  id: string;
  email: string;
  nickname: string;
  role: string;
  balance: number;
  referralsCount: number;
  referralCode: string;
  referralAllLose: number;
  isBanned: boolean;
}
