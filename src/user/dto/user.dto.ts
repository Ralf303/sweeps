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
