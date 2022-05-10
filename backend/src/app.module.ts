import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
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
    DatabaseModule,
    ChatModule,
    UserModule],
})
export class AppModule {}
