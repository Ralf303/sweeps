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
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Pagination offset, default 0',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of top wins sorted by multiplier',
  })
  getLeaderboard(@Query('offset') offset = '0') {
    console.log('getLeaderboard', offset);
    return this.stats.getLeaderboardByMaxX(+offset);
  }

  @Get('referrals')
  @ApiOperation({
    summary: "Get user's referrals ranked by total losses (globalLose)",
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Pagination offset, default 0',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of referrals with their globalLose stats',
  })
  getReferrals(@Req() req: any, @Query('offset') offset = '0') {
    console.log('getReferrals', req.user.id, offset);
    return this.stats.getUserReferralsStats(req.user.id, +offset);
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
  @ApiResponse({
    status: 200,
    description:
      'Returns game history records with balanceBefore, bet, multiplier, profit, balanceAfter',
  })
  getGames(@Req() req: any, @Query('offset') offset = '0') {
    console.log('getGames', req.user.id, offset);

    return this.stats.getGameHistory(req.user.id, +offset);
  }
}
