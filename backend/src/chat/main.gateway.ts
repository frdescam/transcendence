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

interface receiveMessage {
  id: number,
  channel: number,
  message: string,
  length: number,
  timestamp: Date,
  hash: string
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
  
  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('add')
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
    // this.server.emit('newMessage', newMessage);
    const ret = await this.messageService.create(newMessage);
    if (ret.created === false)
      throw new Error(ret.message);
    else
      this.server.emit('newMessage', ret);
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('update')
  updateMessage(message: MessageDTO, sender: Socket) {
    this.logger.log(`Client ${sender.id} update ${message.content}`);
    this.messageService.update(message);
    sender.emit('message::update', message);
    sender.broadcast.emit('message::update', message);
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('delete')
  deleteMessage(message: MessageDTO, sender: Socket) {
    this.logger.log(`Client ${sender.id} remove ${message.id}`);
    this.messageService.remove(message);
    sender.emit('message::delete', message);
    sender.broadcast.emit('message::delete', message);
  }
}
