import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'NewNick',
    description: 'New nickname',
    required: false,
  })
  nickname?: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password',
    required: false,
  })
  password?: string;
}

export class UpdateBalanceDto {
  @ApiProperty({ example: 100.5, description: 'New balance amount' })
  amount: number;
}

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Уникальный идентификатор пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Уникальный никнейм пользователя',
  })
  nickname: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя',
    enum: ['user', 'admin', 'moderator'],
  })
  role: string;

  @ApiProperty({
    example: 100.5,
    description: 'Баланс пользователя',
  })
  balance: number;

  @ApiProperty({
    example: 5,
    description: 'Количество рефералов',
  })
  referralsCount: number;

  @ApiProperty({
    example: 2,
    description: 'Уровень реферальной программы',
  })
  referralLevel: number;

  @ApiProperty({
    example: 'REF123',
    description: 'Реферальный код пользователя',
  })
  referralCode: string;

  @ApiProperty({
    example: 'US',
    description: 'Страна пользователя',
  })
  country?: string;

  @ApiProperty({
    example: 10,
    description: 'Процент реферальных отчислений',
  })
  refPercentage: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID пользователя, который пригласил текущего пользователя',
    nullable: true,
  })
  referredById?: string;

  @ApiProperty({
    description: 'Основная информация о пользователе, который пригласил',
    nullable: true,
  })
  referredBy?: {
    id: string;
    nickname: string;
  };

  @ApiProperty({
    example: 25.5,
    description: 'Сумма проигрыша пользователя за текущий день',
    default: 0,
  })
  dailyLose: number;

  @ApiProperty({
    example: 150.75,
    description: 'Общая сумма проигрышей по реферальной сети пользователя',
    default: 0,
  })
  referralAllLose: number;

  @ApiProperty({
    example: false,
    description: 'Заблокирован ли пользователь',
  })
  isBanned: boolean;
  @ApiProperty({
    example: '2023-05-15T10:00:00Z',
    description: 'Дата регистрации пользователя',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-06-20T15:30:00Z',
    description: 'Дата последнего обновления данных пользователя',
  })
  updatedAt: Date;
}
