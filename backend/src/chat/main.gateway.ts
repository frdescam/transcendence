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

import * as crypto from 'crypto';
import { ChannelDTO } from './orm/channel.dto';
import { channelTypesDTO } from './orm/channelTypes.dto';

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

interface receiveChannel {
  id: number,
  creator: number,
  name: string,
  type: string,
  password: string
}

@WebSocketGateway({
  namespace: 'chat::',
  cors: {
    origin: '*',
  },
})
export class MainGateway implements NestGateway
{
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService
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
  
  //#region Channel
  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::add')
  async newChannel(channel: receiveChannel, sender: Socket) {
    this.logger.log(`Client ${sender.id} create a channel at ${new Date().toDateString()}`);
    const __owner = await this.userService.getOne(channel.creator);
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
    const ret = await this.channelService.create(__newChannel);
    if (ret.created === false)
      throw new Error(ret.message);
    else
      this.server.emit('newChannel', ret);
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('channel::update')
  async updateChannel(channel: receiveChannel, sender: Socket) {
    this.logger.log(`Client ${sender.id} update a channel at ${new Date().toDateString()}`);
    const ret = await this.channelService.update({
      id: channel.id,
      owner: await this.userService.getOne(channel.creator),
      name: channel.name,
      type: undefined,
      password: channel.password,
      creationDate: undefined,
      messages: null,
      bannedUsers: null,
      mutedUsers: null,
      admins: [],
      users: []
    });
    if (ret.updated === false)
      throw new Error(ret.message);
    else
      this.server.emit('updateChannel', ret);
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
    if (ret.deleted === false)
      throw new Error(ret.message);
    else
      this.server.emit('deleteChannel', ret);
  }
  // #endregion

  // #region Message
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
    const ret = await this.messageService.create(newMessage);
    if (ret.created === false)
      throw new Error(ret.message);
    else
      this.server.emit('newMessage', ret);
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
    const ret = await this.messageService.update(newMessage);
    if (ret.updated === false)
      throw new Error(ret.message);
    else
      this.server.emit('updateMessage', ret);
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
    const ret = await this.messageService.remove(newMessage);
    if (ret.deleted === false)
      throw new Error(ret.message);
    else
      this.server.emit('deleteMessage', ret);
  }
  // #endregion
}
