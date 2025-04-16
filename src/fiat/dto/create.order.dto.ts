import { IsString, IsNumber, IsNotEmpty, Min, Length } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @Min(1)
  amountFrom: number;

  @IsString()
  @IsNotEmpty()
  currencyFrom: string;

  @IsString()
  @IsNotEmpty()
  currencyTo: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @Length(2, 2)
  country: string;
}
