import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
    constructor (private leaderboardService: LeaderboardService) {}
    @Get('getRows')
    async getRows(@Query('startRow') startRow, @Query('count') count, @Query('filter') filter, @Query('sortBy') sortBy, @Query('descending') descending) {
        return this.leaderboardService.getRows(startRow, count, filter, sortBy, descending);
    }
}
