import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ForgotDto {
  @IsEmail() email: string;
}

export class ResetDto {
  @IsEmail() email: string;

  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @IsNotEmpty()
  @Length(8, 32)
  newPassword: string;
}
