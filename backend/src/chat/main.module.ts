import { Module } from '@nestjs/common';

import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
// import { ChatGateway } from './main.gateway';

@Module({
  imports: [ChannelModule, MessageModule],
  // providers: [ChatGateway]
})
export class ChatModule {}
