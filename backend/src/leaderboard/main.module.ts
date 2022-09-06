import { Module } from '@nestjs/common';
import { _LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [_LeaderboardModule],
  exports: [_LeaderboardModule],
})
export class LeaderboardModule {}
