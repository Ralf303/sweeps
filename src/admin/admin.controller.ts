import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserDto } from 'src/user/dto/user.dto';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { StatsResponseDto } from './dto/stats.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'Get list of users with optional pagination and ban filter',
  })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get()
  getUsers(
    @Query('start') start: string,
    @Query('bannedOnly') bannedOnly: string,
  ) {
    const startIndex = parseInt(start) || 0;
    const isBanned = bannedOnly === 'true';
    return this.adminService.getUsers({ startIndex, isBanned });
  }

  @ApiOperation({ summary: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned' })
  @Post('ban/:id')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @ApiOperation({ summary: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned' })
  @Post('unban/:id')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @ApiOperation({ summary: 'Update user data (nickname/password)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @Post('update/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Получить статистику системы' })
  @ApiResponse({
    status: 200,
    description: 'Статистика успешно получена',
    type: StatsResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  @Get('stats')
  async getStats(): Promise<StatsResponseDto> {
    return this.adminService.getUserStats();
  }
}
