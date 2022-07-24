import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('api/leaderboard')
export class LeaderboardController {
    constructor (private leaderboardService: LeaderboardService) {}
    @Get('getRows')
    async getRows(@Query('userId') userId: number, @Query('friendsOnly') friendsOnly: boolean, @Query('startRow') startRow: number, @Query('count') count: number, @Query('filter') filter: string, @Query('sortBy') sortBy:string, @Query('descending') descending:string) {
        return this.leaderboardService.getRows(userId, friendsOnly, startRow, count, filter, sortBy, descending);
    }
}
