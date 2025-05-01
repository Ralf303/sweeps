import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Название инвойса' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Описание инвойса', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Валюта инвойса' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Валюта отправителя', required: false })
  @IsOptional()
  @IsString()
  sender_currency?: string;

  @ApiProperty({ description: 'Сумма инвойса' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Вторичный идентификатор' })
  @IsString()
  foreign_id: string;

  @ApiProperty({
    description: 'URL для успешного завершения',
    example: 'https://example.com/success',
  })
  @IsUrl({ protocols: ['https'] })
  url_success: string;

  @ApiProperty({
    description: 'URL для неудачного завершения',
    example: 'https://example.com/failed',
  })
  @IsUrl({ protocols: ['https'] })
  url_failed: string;

  @ApiProperty({ description: 'Email пользователя', required: false })
  @IsOptional()
  @IsString()
  email_user?: string;

  @ApiProperty({ description: 'Таймер', required: false })
  @IsOptional()
  @IsBoolean()
  timer?: boolean;
}
