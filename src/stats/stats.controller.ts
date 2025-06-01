import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { Period } from 'src/slots/types/period';

@ApiTags('Stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Get leaderboard by maximum multiplier (x) for wins',
  })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'global'],
    description: 'Период топа (default: global)',
  })
  getLeaderboard(
    @Query('offset') offset = '0',
    @Query('period')
    period: Period = 'global',
  ) {
    return this.stats.getLeaderboardByMaxX(+offset, period);
  }

  @Get('referrals')
  @ApiOperation({ summary: "Get user's referrals ranked by total losses" })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['daily', 'weekly', 'monthly', 'global'],
    description: 'Период топа (default: global)',
  })
  getReferrals(
    @Req() req: any,
    @Query('offset') offset = '0',
    @Query('period')
    period: Period = 'global',
  ) {
    return this.stats.getUserReferralsStats(req.user.id, +offset, period);
  }

  @Get('crypto')
  @ApiOperation({ summary: "Get user's crypto deposit/withdraw history" })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Pagination offset, default 0',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns crypto transactions history',
  })
  getCrypto(@Req() req: any, @Query('offset') offset = '0') {
    console.log('getCrypto', req.user.id, offset);
    return this.stats.getCryptoHistory(req.user.id, +offset);
  }

  @Get('games')
  @ApiOperation({
    summary: "Get user's game history with bet and win snapshots",
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Pagination offset, default 0',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['daily', 'weekly', 'monthly', 'global'],
    description: 'Период выборки (default: global)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns game history records with balanceBefore, bet, multiplier, profit, balanceAfter',
  })
  getGames(
    @Req() req: any,
    @Query('offset') offset = '0',
    @Query('period')
    period: Period = 'global',
  ) {
    console.log('getGames', req.user.id, offset, period);
    return this.stats.getGameHistory(req.user.id, +offset, period);
  }
}
