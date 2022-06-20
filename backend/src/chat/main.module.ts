import { Module } from '@nestjs/common';

import { BannedModule } from './banned/banned.module';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { MutedModule } from './muted/muted.module';
// import { ChatGateway } from './main.gateway';

@Module({
  imports: [
    BannedModule,
    ChannelModule,
    MessageModule,
    MutedModule,
  ],
  // providers: [ChatGateway]
})
export class ChatModule {}
