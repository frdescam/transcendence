import * as process from 'process';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database.module';
import { GameModule } from './game/main.module';
import { ChatModule } from './chat/main.module';
import { MatchModule } from './match/main.module';
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['./src/auth/.auth.env'], isGlobal: true, }), 
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: (
        (process.env.NODE_ENV === 'production') ?
          path.join(__dirname, '..', 'frontend', 'dist') :
          path.join(__dirname, '..', 'static_dev')
      )
    }),
    MatchModule,
    ChatModule,
    GameModule,
    LeaderboardModule
  ],
})
export class AppModule { }
