import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User data' })
  @Get('me')
  getCurrentUser(@Req() req: { user: UserResponseDto }) {
    return this.userService.getCurrentUser(req.user.id);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User data' })
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getCurrentUser(id);
  }
}
