import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { LogsService } from './logs.service';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs with pagination' })
  async getAll(@Query() pagination: PaginationDto) {
    return this.logsService.getAllLogs(pagination);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get logs for a specific user with pagination' })
  async getByUser(@Param('id') id: string, @Query() pagination: PaginationDto) {
    return this.logsService.getUserLogs(id, pagination);
  }
}
