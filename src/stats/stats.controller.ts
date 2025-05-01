import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsResponseDto } from './dto/stats.dto';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @ApiOperation({ summary: 'Получить статистику системы' })
  @ApiResponse({
    status: 200,
    description: 'Статистика успешно получена',
    type: StatsResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  @Get()
  async getStats(): Promise<StatsResponseDto> {
    return this.statsService.getUserStats();
  }
}
