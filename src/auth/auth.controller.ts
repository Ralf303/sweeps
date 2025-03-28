import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto/auth.dto';

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
}
