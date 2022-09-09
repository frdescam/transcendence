import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/main.module';

import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { FriendshipModule } from 'src/users/friendship/friendship.module';

@Module({
  imports: [UsersModule, FriendshipModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService]
})
export class _LeaderboardModule {}
