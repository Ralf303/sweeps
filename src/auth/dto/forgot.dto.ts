import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotDto {
  @ApiProperty({
    description: 'Email пользователя, на который придёт код для сброса пароля',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}

export class ResetDto {
  @ApiProperty({
    description: 'Email пользователя, для которого сбрасываем пароль',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '6-значный код из письма',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'Новый пароль (от 8 до 32 символов)',
    example: 'newStrongP@ssw0rd',
    minLength: 8,
    maxLength: 32,
  })
  @IsNotEmpty()
  @Length(8, 32)
  newPassword: string;
}
