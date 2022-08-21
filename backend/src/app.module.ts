import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database.module';
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
//import { GameModule } from './game/game.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as process from 'process';
import * as path from 'path';
import { ConfigModule } from '@nestjs/config';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ['./src/auth/.auth.env'], isGlobal: true, }), 
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ChatModule,
    LeaderboardModule,
    //GameModule
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', './upload/avatars/',),
      serveRoot: '/public',
    }),
  ],
})
export class AppModule { }
