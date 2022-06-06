import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user.entity';
import { TestUserModule } from './test_user/test_user.module';
import { Message } from './message.entity';
import { Channel } from './channel.entity';
import { MutedUser } from './mutedUser.entity';
import { BannedUser } from './bannedUser.entity';
import { PendingInvitation } from './pendingInvitation.entity';
import { Match } from './match.entity';
import { TestMatchModule } from './test_match/test_match.module';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "transcendence",
      password: "password",
      database: "transcendence",
      entities: [
          User,
          Match,
          Message,
          Channel,
          MutedUser,
          BannedUser,
          PendingInvitation,
        ],
      synchronize: true,
  }),
  TestUserModule,
  TestMatchModule,
],
  controllers: [],
  providers: [],
})
export class AppModule {}