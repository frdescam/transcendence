import { Module } from '@nestjs/common';

import { BannedModule } from './banned/banned.module';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { MutedModule } from './muted/muted.module';
import { UsersModule } from 'src/users/main.module';

import { MainGateway } from './main.gateway';
import { ChatCron } from './cron/cron.service';

@Module({
  imports: [
    UsersModule,
    BannedModule,
    ChannelModule,
    MessageModule,
    MutedModule,
  ],
  providers: [
    MainGateway,
    ChatCron
  ]
})
export class ChatModule {}
