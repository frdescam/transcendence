import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { map } from './party/interfaces/party.interface';
import { PartyService } from './party/party.service';
import type { Socket, Server } from 'socket.io';
import type { userId } from 'src/common/game/logic/common';

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
    try
    {
      const himself: userId = 1;
      this.partyService.createParty(
        room,
        map,
        [himself, null],
        client
      );
    }
    catch (error)
    {
      let message;
      if ('message' in error)
        message = error.message;
      else
        message = error;
      this.partyService.sendError(message, client);
    }
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

  @SubscribeMessage('game::query::find')
  query(
    @ConnectedSocket() client: Socket,
    @MessageBody('map') map?: string,
  ): void
  {
    const room = this.partyService.find({map});

    if (room)
      client.emit('game::query::found', room);
    else
    {
      client.emit('game::query::notFound');
      this.partyService.queryParty(client, {map});
    }
  }

  @SubscribeMessage('game::query::leaveAll')
  leaveAllQuery(
    @ConnectedSocket() client: Socket
  ): void
  {
    this.partyService.leaveAllQuery(client);
  }
}
