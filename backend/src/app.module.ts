import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database.module';
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as process from 'process';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: (
        (process.env.NODE_ENV === 'production') ?
        path.join(__dirname, '..', 'frontend', 'dist') :
        path.join(__dirname, '..', 'static_dev')
      )
    }),
    ConfigModule.forRoot({ envFilePath: ['./src/auth/.auth.env'], isGlobal: true, }), 
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ChatModule,
    GameModule
  ],
})
export class AppModule { }
