import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateCurriencyDto {
  @ApiProperty({
    example: 100,
    description: 'Курс валюты',
  })
  @IsNumber()
  rate: number;
}
