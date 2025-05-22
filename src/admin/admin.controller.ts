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
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({
    summary: 'Get list of users with optional pagination and ban filter',
  })
  @ApiResponse({ status: 200, description: 'List of users' })
  @UseGuards(AdminGuard)
  @Get('users')
  async getUsers(
    @Query('start') start: string,
    @Query('bannedOnly') bannedOnly: string,
  ) {
    const startIndex = parseInt(start) || 0;
    const isBanned = bannedOnly === 'true';
    return await this.adminService.getUsers({ startIndex, isBanned });
  }

  @ApiOperation({ summary: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned' })
  @UseGuards(AdminGuard)
  @Post('ban/:id')
  async banUser(@Param('id') id: string) {
    return await this.adminService.banUser(id);
  }

  @ApiOperation({ summary: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned' })
  @UseGuards(AdminGuard)
  @Post('unban/:id')
  async unbanUser(@Param('id') id: string) {
    return await this.adminService.unbanUser(id);
  }

  @ApiOperation({ summary: 'Update user balance' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @UseGuards(AdminGuard)
  @Post('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.adminService.updateUser(
      id,
      updateUserDto.balance as number,
    );
  }

  @ApiOperation({ summary: 'Получить статистику системы' })
  @ApiResponse({
    status: 200,
    description: 'Статистика успешно получена',
    type: StatsResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  @UseGuards(AdminGuard)
  @Get('stats')
  async getStats(): Promise<StatsResponseDto> {
    return await this.adminService.getUserStats();
  }

  @ApiOperation({ summary: 'Удалить аватарку юзера по id' })
  @ApiResponse({ status: 200, description: 'Avatar deleted' })
  @UseGuards(AdminGuard)
  @Post('delete-avatar/:id')
  async deleteAvatar(@Param('id') id: string) {
    return await this.adminService.deleteAvatar(id);
  }
}
