import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ForgotDto, ResetDto } from './dto/forgot.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User registration with optional referral code' })
  @ApiResponse({ status: 201, description: 'JWT token' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.email,
      body.password,
      body.nickname,
      body.referralCode,
    );
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'JWT token' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @ApiOperation({ summary: 'Запрос кода для сброса пароля' })
  @ApiResponse({
    status: 200,
    description: 'Код успешно отправлен на email',
    schema: {
      example: { message: 'Код отправлен на email' },
    },
  })
  @ApiBody({ type: ForgotDto })
  @Post('forgot-password')
  forgot(@Body() dto: ForgotDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Сброс пароля по коду из письма' })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно обновлён',
    schema: {
      example: { message: 'Пароль успешно обновлён' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный код или другие ошибки валидации',
    schema: {
      example: {
        statusCode: 400,
        message: 'Неверный код',
        error: 'Bad Request',
      },
    },
  })
  @ApiBody({ type: ResetDto })
  @Post('reset-password')
  reset(@Body() dto: ResetDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }
}
