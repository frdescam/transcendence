import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { map } from './party/interfaces/party.interface';
import type { Socket, Server } from 'socket.io';
import { PartyService } from './party/party.service';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayDisconnect
{
  constructor(private partyService: PartyService) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket)
  {
    this.partyService.leaveAll(client);
    this.partyService.leaveAllQuery(client);
  }

  @SubscribeMessage('party::create')
  handleCreate(
    @MessageBody('room') room: string,
    @MessageBody('map') map: map,
    @ConnectedSocket() client: Socket,
  ): void
  {
    this.partyService.createParty(room, map, client);
  }

  @SubscribeMessage('party::join')
  handleJoin(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
  ): void
  {
    const party = this.partyService.findParty(room);

    if (party)
      this.partyService.joinParty(party, client);
    else
      this.partyService.sendError("Party not found", client);
  }

  @SubscribeMessage('party::leaveAll')
  handleLeaveAll(
    @ConnectedSocket() client: Socket,
  ): void
  {
    this.partyService.leaveAll(client);
  }

  @SubscribeMessage('party::move')
  handleMove(
    @MessageBody('position') position: number,
    @ConnectedSocket() client: Socket,
  ): void
  {
    this.partyService.move(position / 1000, client);
  }

  @SubscribeMessage('party::click')
  handleClick(
    @ConnectedSocket() client: Socket,
  ): void
  {
    this.partyService.click(client);
  }

  @SubscribeMessage('play::find')
  query(
    @ConnectedSocket() client: Socket,
    @MessageBody('map') map?: string,
  ): void
  {
    const room = this.partyService.find({map});

    if (room)
      client.emit('play::found', room);
    else
    {
      client.emit('play::notFound');
      this.partyService.queryParty(client, {map});
    }
  }

  @SubscribeMessage('play::leaveAll')
  leaveAllQuery(
    @ConnectedSocket() client: Socket
  ): void
  {
    this.partyService.leaveAllQuery(client);
  }
}
