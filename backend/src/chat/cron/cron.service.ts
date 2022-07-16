import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { BannedService } from '../banned/banned.service';
import { ChannelService } from '../channel/channel.service';
import { MutedService } from '../muted/muted.service';

import { Server } from 'socket.io';
import { Channel } from '../orm/channel.entity';

import { timestamp } from '../interface';


@WebSocketGateway({
  namespace: 'chat::',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatCron {
  constructor(
    private readonly bannedService: BannedService,
    private readonly channelService: ChannelService,
    private readonly mutedService: MutedService
  ) {}

  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatCron.name);

  /**
   * This functions is separate and asynchronous for accelerating system
   */

  async checkMute(channel: Channel, currentDate: Date) {
    for (const mute of channel.mutedUsers)
    {
      const untilDate = new Date(mute.until);
      if (untilDate.getTime() <= currentDate.getTime()) {
        this.logger.log(`User ${mute.user.id} is unmute on channel ${channel.id}`);
        this.server.emit(
          'muted::cron::delete',
          await this.mutedService.delete({
            id: mute.id,
            channel,
            user: mute.user,
            until: undefined
          })
        );
      }
    }
  }

  async checkBan(channel: Channel, currentDate: Date) {
    for (const ban of channel.bannedUsers)
    {
      const untilDate = new Date(ban.until);
      if (untilDate.getTime() <= currentDate.getTime()) {
        this.logger.log(`User ${ban.user.id} is unban on channel ${channel.id}`);
        this.server.emit(
          'banned::cron::delete',
          await this.bannedService.delete({
            id: ban.id,
            channel,
            user: ban.user,
            until: undefined
          })
        );
      }
    }
  }
  
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'bannedMuted'
  })
  async checkBannedMutedUser() {
    const channels = await this.channelService.getCron();
    const currentDate = new Date();
    for (const channel of channels)
    {
      this.checkMute(channel, currentDate);
      this.checkBan(channel, currentDate);
    }
  }
}
