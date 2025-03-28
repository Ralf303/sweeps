import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateUserDto, UpdateBalanceDto } from './dto/user.dto';
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
  getCurrentUser(@Req() req) {
    return this.userService.getCurrentUser(req.user.id);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User data' })
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned' })
  @Post('ban/:id')
  banUser(@Param('id') id: string) {
    return this.userService.banUser(id);
  }

  @ApiOperation({ summary: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned' })
  @Post('unban/:id')
  unbanUser(@Param('id') id: string) {
    return this.userService.unbanUser(id);
  }

  @ApiOperation({ summary: 'Update user data (nickname/password)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @Post('update/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Update user balance' })
  @ApiResponse({ status: 200, description: 'Balance updated' })
  @Post('balance/:id')
  updateBalance(
    @Param('id') id: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    return this.userService.updateBalance(id, updateBalanceDto.amount);
  }
}
