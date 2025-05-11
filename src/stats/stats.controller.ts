// stats/stats.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('leaderboard')
  getLeaderboard(@Query('offset') offset = '0') {
    return this.stats.getLeaderboardByMaxX(+offset);
  }

  @Get('referrals')
  getReferrals(@Req() req: any, @Query('offset') offset = '0') {
    return this.stats.getUserReferralsStats(req.user.id, +offset);
  }

  @Get('crypto')
  getCrypto(@Req() req: any, @Query('offset') offset = '0') {
    return this.stats.getCryptoHistory(req.user.id, +offset);
  }

  @Get('games')
  getGames(@Req() req: any, @Query('offset') offset = '0') {
    return this.stats.getGameHistory(req.user.id, +offset);
  }
}
