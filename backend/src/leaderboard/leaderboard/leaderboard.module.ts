import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/main.module';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [UsersModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService]
})
export class _LeaderboardModule {}
