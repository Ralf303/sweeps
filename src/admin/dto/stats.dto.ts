// stats-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';

export class StatsResponseDto {
  @ApiProperty({
    example: 1000,
    description: 'Общее количество пользователей',
  })
  totalUsers: number;

  @ApiProperty({
    example: 50,
    description: 'Количество забаненных пользователей',
  })
  bannedUsers: number;

  @ApiProperty({
    example: 15,
    description: 'Количество новых пользователей за сегодня',
  })
  todayUsers: number;

  @ApiProperty({
    example: 120,
    description: 'Количество новых пользователей за 7 дней',
  })
  weekUsers: number;

  @ApiProperty({
    example: 450,
    description: 'Количество новых пользователей за 30 дней',
  })
  monthUsers: number;

  @ApiProperty({
    example: 1500.75,
    description: 'Сумма пополнений за сегодня (в USD)',
  })
  todayDeposits: number | Decimal;

  @ApiProperty({
    example: 12500.2,
    description: 'Сумма пополнений за 7 дней (в USD)',
  })
  weekDeposits: number | Decimal;

  @ApiProperty({
    example: 45000.8,
    description: 'Сумма пополнений за 30 дней (в USD)',
  })
  monthDeposits: number | Decimal;

  @ApiProperty({
    example: 150000.25,
    description: 'Сумма пополнений за всё время (в USD)',
  })
  totalDeposits: number | Decimal;

  @ApiProperty({
    example: 87500.6,
    description: 'Суммарный баланс всех пользователей (в USD)',
  })
  totalBalances: number;
}
