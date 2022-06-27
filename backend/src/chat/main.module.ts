import { Module } from '@nestjs/common';

import { BannedModule } from './banned/banned.module';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { MutedModule } from './muted/muted.module';
import { MainGateway } from './main.gateway';
import { UserModule } from 'src/user/main.module';

@Module({
  imports: [
    UserModule,
    BannedModule,
    ChannelModule,
    MessageModule,
    MutedModule,
  ],
  providers: [MainGateway]
})
export class ChatModule {}
