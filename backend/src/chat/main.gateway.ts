import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Bind, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { MessageService } from './message/message.service';
import { MessageDTO } from './orm/message.dto';

import { UserService } from 'src/user/user/user.service';
import { ChannelService } from './channel/channel.service';
import { MutedService } from './muted/muted.service';
import { BannedService } from './banned/banned.service';

import * as crypto from 'crypto';

import { ChannelDTO } from './orm/channel.dto';
import { channelTypesDTO } from './orm/channelTypes.dto';
import { MutedDTO } from './orm/muted.dto';
import { BannedDTO } from './orm/banned.dto';

interface interfaceBanMut {
  id: number,
  userId: number,
  channelId: number,
  until: Date
}

interface receiveChannel {
  id: number,
  creator: number,
  name: string,
  type: string,
  password: string
}

interface receiveMessage {
  id: number,
  channel: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
}

interface updateMessage {
  id: number,
  channel: number,
  messageId: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
}

interface channelUser {
  userId: number,
  channelId: number,
}

const getType = (type: string) => {
  switch (type) {
  case 'public':
    return channelTypesDTO.PUBLIC;
  case 'protected':
    return channelTypesDTO.PROTECTED;
  case 'private':
    return channelTypesDTO.PRIVATE;
  default:
    return channelTypesDTO.DIRECT;
  }
};

@WebSocketGateway({
  namespace: 'chat::',
  cors: {
    origin: '*',
  },
})
export class MainGateway implements NestGateway
{
  constructor(
    private readonly userService: UserService,

    private readonly bannedService: BannedService,
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService,
    private readonly mutedService: MutedService,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('Server chat init', server);
  }
  handleConnection(client: Socket) {
    this.logger.log(`Client ${client.id} is connected`);
    this.server.emit('clientConnect', client.id);
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} is disconnected`);
    this.server.emit('clientDisconnect', client.id);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  returnData(sender: Socket, data: any) {
    return {
      socketId: sender.id,
      data
    };
  }

  //#region Muted
  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('muted::set')
  async setMuted(muted: interfaceBanMut, sender: Socket) {
    this.logger.log(`Client ${sender.id} mute user ${muted.userId} until ${muted.until}`);
    const __newMuted: MutedDTO = {
      id: undefined,
      channel: await this.channelService.getOne(muted.channelId),
      user: await this.userService.getOne(muted.userId),
      until: new Date(muted.until)
    };
    this.server.emit('muted::receive::set', this.returnData(sender, await this.mutedService.set(__newMuted)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('muted::delete')
  async deleteMuted(muted: interfaceBanMut, sender: Socket) {
    this.logger.log(`Client ${sender.id} unmute user ${muted.userId}`);
    const __newMuted: MutedDTO = {
      id: muted.id,
      channel: undefined,
      user: undefined,
      until: undefined
    };
    this.server.emit('muted::receive::delete', this.returnData(sender, await this.mutedService.delete(__newMuted)));
  }
  //#endregion

  //#region Banned
  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('banned::set')
  async setBanned(banned: interfaceBanMut, sender: Socket) {
    this.logger.log(`Client ${sender.id} mute user ${banned.userId} until ${banned.until}`);
    const __newBanned: BannedDTO = {
      id: undefined,
      channel: await this.channelService.getOne(banned.channelId),
      user: await this.userService.getOne(banned.userId),
      until: new Date(banned.until)
    };
    this.server.emit('banned::receive::set', this.returnData(sender, await this.bannedService.set(__newBanned)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('banned::delete')
  async deleteBanned(banned: interfaceBanMut, sender: Socket) {
    this.logger.log(`Client ${sender.id} unmute user ${banned.userId}`);
    const __newBanned: BannedDTO = {
      id: banned.id,
      channel: undefined,
      user: undefined,
      until: undefined
    };
    this.server.emit('banned::receive::delete', this.returnData(sender, await this.bannedService.delete(__newBanned)));
  }
  //#endregion

  //#region Users
  @Bind(ConnectedSocket())
  @SubscribeMessage('users::getAll')
  async getEveryUsers(sender: Socket) {
    this.logger.log(`Client ${sender.id} get every user(s) at ${new Date().toDateString()}`);
    this.server.emit('users::receive::getAll', this.returnData(sender, await this.userService.getAll()));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('users::get')
  async getUser(id: number, sender: Socket) {
    this.logger.log(`Client ${sender.id} get user ${id} at ${new Date().toDateString()}`);
    this.server.emit('users::receive::get', this.returnData(sender, await this.userService.getOne(id)));
  }
  //#endregion

  //#region Channel
  @Bind(ConnectedSocket())
  @SubscribeMessage('channel::gets')
  async getChannels(sender: Socket) {
    this.logger.log(`Client ${sender.id} get channel(s) at ${new Date().toDateString()}`);
    this.server.emit('channel::receive::gets', this.returnData(sender, await this.channelService.getAllNoMessages()));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::get')
  async getChannel(channelId: number, sender: Socket) {
    this.logger.log(`Client ${sender.id} get channel ${channelId} at ${new Date().toDateString()}`);
    this.server.emit('channel::receive::get', this.returnData(sender, await this.channelService.getOneNoMessages(channelId)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::add')
  async newChannel(channel: receiveChannel, sender: Socket) {
    this.logger.log(`Client ${sender.id} create a channel at ${new Date().toDateString()}`);
    const __owner = await this.userService.getOne(channel.creator);
    const __newChannel: ChannelDTO = {
      id: undefined,
      owner: __owner,
      name: channel.name,
      type: getType(channel.type),
      password: channel.password,
      creationDate: undefined,
      messages: null,
      bannedUsers: null,
      mutedUsers: null,
      admins: [ __owner ],
      users: [ __owner ]
    };
    const retChannel = await this.channelService.create(__newChannel);
    const retUser = await this.channelService.addUser(retChannel.data.id, __owner);
    this.server.emit('channel::receive::add', {
      socketId: sender.id,
      channel: retChannel,
      user: retUser
    });
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::update')
  async updateChannel(channel: receiveChannel, sender: Socket) {
    this.logger.log(`Client ${sender.id} update a channel at ${new Date().toDateString()}`);
    const ret = await this.channelService.update({
      id: channel.id,
      owner: await this.userService.getOne(channel.creator),
      name: channel.name,
      type: getType(channel.type),
      password: channel.password,
      creationDate: undefined,
      messages: null,
      bannedUsers: null,
      mutedUsers: null,
      admins: [],
      users: []
    });
    this.server.emit('channel::receive::update', this.returnData(sender, ret));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::delete')
  async deleteChannel(channel: receiveChannel, sender: Socket) {
    this.logger.log(`Client ${sender.id} delete a channel at ${new Date().toDateString()}`);
    await this.messageService.removeAll(channel.id);
    const ret = await this.channelService.remove({
      id: channel.id,
      owner: undefined,
      name: undefined,
      type: undefined,
      password: undefined,
      creationDate: undefined,
      messages: null,
      bannedUsers: null,
      mutedUsers: null,
      admins: [],
      users: []
    });
    this.server.emit('channel::receive::delete', this.returnData(sender, ret));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::user::add')
  async addUserToChannel(user: channelUser, sender: Socket) {
    this.logger.log(`Client ${sender.id} add user ${user.userId} to channel ${user.channelId} at ${new Date().toDateString()}`);
    const getUser = await this.userService.getOne(user.userId);
    if (!getUser)
      this.server.emit('channel::user::receive::add', {
        socketId: sender.id,
        channel: undefined,
        user: getUser
      });
    else
      this.server.emit('channel::user::receive::add', {
        socketId: sender.id,
        channel: await this.channelService.addUser(user.channelId, getUser),
        user: getUser
      });
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::user::remove')
  async removeUserToChannel(user: channelUser, sender: Socket) {
    this.logger.log(`Client ${sender.id} remove user ${user.userId} to channel ${user.channelId} at ${new Date().toDateString()}`);
    const getUser = await this.userService.getOne(user.userId);
    if (!getUser)
      this.server.emit('channel::user::receive::remove', {
        socketId: sender.id,
        channel: undefined,
        user: getUser
      });
    else
      this.server.emit('channel::user::receive::remove', {
        socketId: sender.id,
        channel: await this.channelService.removeUser(user.channelId, getUser),
        user: getUser
      });
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::admin::add')
  async addAdminToChannel(user: channelUser, sender: Socket) {
    this.logger.log(`Client ${sender.id} add admin ${user.userId} to channel ${user.channelId} at ${new Date().toDateString()}`);
    const getUser = await this.userService.getOne(user.userId);
    if (!getUser)
      this.server.emit('channel::admin::receive::add', {
        socketId: sender.id,
        channel: undefined,
        user: getUser
      });
    else
      this.server.emit('channel::admin::receive::add', getUser, {
        socketId: sender.id,
        channel: await this.channelService.addAdmin(user.channelId, getUser),
        user: getUser
      });
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::admin::remove')
  async removeAminToChannel(user: channelUser, sender: Socket) {
    this.logger.log(`Client ${sender.id} remove admin ${user.userId} to channel ${user.channelId} at ${new Date().toDateString()}`);
    const getUser = await this.userService.getOne(user.userId);
    if (!getUser)
      this.server.emit('channel::admin::receive::remove', {
        socketId: sender.id,
        channel: undefined,
        user: getUser
      });
    else
      this.server.emit('channel::admin::receive::remove', getUser, {
        socketId: sender.id,
        channel: await this.channelService.removeAdmin(user.channelId, getUser),
        user: getUser
      });
  }
  // #endregion

  // #region Message
  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('messages::get')
  async getMessages(channelId: number, sender: Socket) {
    this.logger.log(`Client ${sender.id} get messages of channel ${channelId} at ${new Date().toDateString()}`);
    this.server.emit('messages::receive::get', this.returnData(sender, await this.messageService.getAll(channelId)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('message::get')
  async getMessage(message: receiveMessage, sender: Socket) {
    this.logger.log(`Client ${sender.id} get messages of channel ${message.channel} at ${new Date().toDateString()}`);
    this.server.emit('message::receive::get', this.returnData(sender, await this.messageService.getOne(message.channel, message.id)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('message::add')
  async newMessage(message: receiveMessage, sender: Socket) {
    const hash = crypto.createHash('sha256').update(message.message).digest('hex');
    if (hash !== message.hash)
      return;
    const messDate = new Date(message.timestamp);
    this.logger.log(`Client ${sender.id} send a message at ${messDate.toDateString()}`);
    const newMessage: MessageDTO = {
      id: undefined,
      create: await this.userService.getOne(message.id),
      channel: await this.channelService.getOneNoMessages(message.channel),
      content: message.message,
      timestamp: message.timestamp,
      modified: undefined
    };
    this.server.emit('message::receive::add', this.returnData(sender, await this.messageService.create(newMessage)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('message::update')
  async update(message: updateMessage, sender: Socket) {
    const hash = crypto.createHash('sha256').update(message.message).digest('hex');
    if (hash !== message.hash)
      return;
    const messDate = new Date(message.timestamp);
    this.logger.log(`Client ${sender.id} update a message at ${messDate.toDateString()}`);
    const newMessage: MessageDTO = {
      id: message.messageId,
      create: await this.userService.getOne(message.id),
      channel: await this.channelService.getOneNoMessages(message.channel),
      content: message.message,
      timestamp: undefined,
      modified: message.timestamp
    };
    this.server.emit('message::receive::update', this.returnData(sender, await this.messageService.update(newMessage)));
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('message::delete')
  async delete(message: updateMessage, sender: Socket) {
    const hash = crypto.createHash('sha256').update(message.message).digest('hex');
    if (hash !== message.hash)
      return;
    const messDate = new Date(message.timestamp);
    this.logger.log(`Client ${sender.id} update a message at ${messDate.toDateString()}`);
    const newMessage: MessageDTO = {
      id: message.messageId,
      create: await this.userService.getOne(message.id),
      channel: await this.channelService.getOneNoMessages(message.channel),
      content: message.message,
      timestamp: undefined,
      modified: message.timestamp
    };
    this.server.emit('message::receive::delete', this.returnData(sender, await this.messageService.remove(newMessage)));
  }
  // #endregion
}
