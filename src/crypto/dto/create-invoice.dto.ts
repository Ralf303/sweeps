import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  sender_currency?: string;

  @IsNumber()
  amount: number;

  @IsString()
  foreign_id: string;

  @IsUrl({ protocols: ['https'] })
  url_success: string;

  @IsUrl({ protocols: ['https'] })
  url_failed: string;

  @IsOptional()
  @IsString()
  email_user?: string;

  @IsOptional()
  @IsBoolean()
  timer?: boolean;
}
