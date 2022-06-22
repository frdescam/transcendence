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


@WebSocketGateway({
  namespace: 'chat::',
  cors: {
    origin: '*',
  },
})
export class MainGateway implements NestGateway
{
  constructor(private messageService: MessageService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Server chat init', server);
  }

  handleConnection(client: Socket, ...args: string[]) {
    this.logger.log(`Client ${client.id} is connected`);
  }
  handleDisconnection(client: Socket) {
    this.logger.log(`Client ${client.id} is disconnected`);
  }
  
  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('new')
  newMessage(message: MessageDTO, sender: Socket) {
    this.logger.log(`Client ${sender.id} send ${message.content}`);
    this.messageService.create(message);
    sender.emit('message::create', message);
    sender.broadcast.emit('message::create', message);
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
