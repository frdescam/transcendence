import { Controller, Get, ParseBoolPipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { User } from 'src/users/orm/user.entity';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor (private leaderboardService: LeaderboardService) {}

    @UseGuards(JwtAuthGuard)
    @Get('getRows')
    async getRows(@AuthUser() user: User, @Query('friendsOnly', ParseBoolPipe) friendsOnly: boolean, @Query('startRow', ParseIntPipe) startRow: number, @Query('count', ParseIntPipe) count: number, @Query('filter') filter: string) {
        return this.leaderboardService.getRows(user, friendsOnly, startRow, count, filter);
    }
}
