import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  namespace: 'user::',
  cors: {
    origin: '*',
  },
})
export class UserGateway
implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(server: Server) {
    this.logger.log('Chat init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} is disconnected`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: string[]) {
    this.logger.log(`Client ${client.id} is connected`);
  }
}
