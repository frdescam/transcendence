import { Module } from '@nestjs/common';

import { ChannelModule } from './channel/channel.module';
import { ChatGateway } from './main.gateway';

@Module({
  imports: [ChannelModule],
  providers: [ChatGateway]
})
export class ChatModule {}
