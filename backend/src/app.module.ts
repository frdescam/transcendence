import * as process from 'process';
import * as path from 'path';

import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database.module';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/main.module';
import { GameModule } from './game/main.module';
import { LeaderboardModule } from './leaderboard/main.module';
import { MatchModule } from './match/main.module';
import { UsersModule } from './users/main.module';
import { FriendshipModule } from './users/friendship/friendship.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['./src/auth/.auth.env'], isGlobal: true, }),
    ServeStaticModule.forRoot({
      rootPath: (
        (process.env.NODE_ENV === 'production') ?
          path.join(__dirname, '..', 'frontend', 'dist') :
          path.join(__dirname, '..', 'static_dev')
      )
    }),
    // ServeStaticModule.forRoot({
    //       rootPath: path.join(__dirname, '..', './upload/avatars/',),
    //       serveRoot: '/public',
    //     }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    
    FriendshipModule,
    AuthModule,
    ChatModule,
    GameModule,
    LeaderboardModule,
    MatchModule,
    UsersModule
  ],
})
export class AppModule {}
