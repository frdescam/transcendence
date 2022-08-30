import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor (private leaderboardService: LeaderboardService) {}

    @Get('getRows')
  async getRows(@Query('userId') userId: number, @Query('friendsOnly') friendsOnly: string, @Query('startRow') startRow: number, @Query('count') count: number, @Query('filter') filter: string) {
    return this.leaderboardService.getRows(userId, friendsOnly, startRow, count, filter);
  }
}
