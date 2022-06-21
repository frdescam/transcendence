import * as process from 'process';
import * as path from 'path';

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DatabaseModule } from './database.module';
import { ChatModule } from './chat/main.module';
import { MatchModule } from './match/main.module';
import { UserModule } from './user/main.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: (
        (process.env.NODE_ENV === 'production') ?
          path.join(__dirname, '..', 'frontend', 'dist') :
          path.join(__dirname, '..', 'static_dev')
      )
    }),
    DatabaseModule,
    ChatModule,
    MatchModule,
    UserModule
  ],
})
export class AppModule {}
