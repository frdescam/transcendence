import { UseGuards, Request } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { map } from './party/interfaces/party.interface';
import { PartyService } from './party/party.service';
import type { Socket, Server } from 'socket.io';
import type { userId, Pong } from 'src/common/game/logic/common';
import { getPartyDto } from 'src/common/game/logic/getParty.dto';
import { SocketMockupAuthGuard } from 'src/usermockup/auth.guard';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayDisconnect
{
  constructor(private partyService: PartyService)
  {
    partyService.setOnListChange(this.onListChange.bind(this));
  }

  @WebSocketServer()
  protected server: Server;

  handleDisconnect(client: Socket)
  {
    this.partyService.leaveAll(client);
    this.partyService.leaveAllQuery(client);
  }

  @SubscribeMessage('party::ping')
  ping(
    @ConnectedSocket() client: Socket,
    @MessageBody('cdate') cdate: string,
  ): void
  {
    client.volatile.emit('party::pong', {cdate, sdate: (new Date()).toISOString()} as Pong);
  }

  @UseGuards(SocketMockupAuthGuard)
  @SubscribeMessage('party::create')
  create(
    @MessageBody('room') room: string,
    @MessageBody('map') map: map,
    @ConnectedSocket() client: Socket,
    @Request() req,
  ): void
  {
    const user: any = req.user;
    this.partyService.checkUserObject(user);
    try
    {
      const userId: userId = user.id;
      this.partyService.createParty(
        room,
        map,
        [userId, null],
        client,
        user
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

  @UseGuards(SocketMockupAuthGuard)
  @SubscribeMessage('party::join')
  join(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
    @Request() req,
  ): void
  {
    const party = this.partyService.findParty(room);
    const user: any = req.user;

    if (party)
      this.partyService.joinParty(party, client, user);
    else
      this.partyService.sendError("Party not found", client);
  }

  @UseGuards(SocketMockupAuthGuard)
  @SubscribeMessage('party::spectate')
  spectate(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
    @Request() req,
  ): void
  {
    const party = this.partyService.findParty(room);
    const user: any = req.user;

    if (party)
      this.partyService.spectateParty(party, client, user);
    else
      this.partyService.sendError("Party not found", client);
  }

  @SubscribeMessage('party::leaveAll')
  leaveAll(
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

  @SubscribeMessage('party::pause')
  pause(
    @ConnectedSocket() client: Socket,
  ): void
  {
    this.partyService.pauseFromClient(client);
  }

  @SubscribeMessage('party::admitdefeat')
  admitDefeat(
    @ConnectedSocket() client: Socket,
  )
  {
    const party = this.partyService.findPartyFromSocket(client);
    if (!party)
      return ({left: false});
    const slot = this.partyService.getSlotFromSocket(party, client);
    if (slot == -1)
      return ({left: false});

    this.partyService.admitDefeat(party, slot);
    return ({left: true});
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

  @SubscribeMessage('game::list::start')
  listStart(
    @ConnectedSocket() client: Socket
  ): void
  {
    client.join('game::list');
    client.emit(
      'game::list::full',
      this.partyService.getAllAsJSON()
    );
  }

  @SubscribeMessage('game::list::stop')
  listStop(
    @ConnectedSocket() client: Socket
  ): void
  {
    client.leave('game::list');
  }

  public onListChange (partyJson: getPartyDto)
  {
    if (this.server)
      this.server.to('game::list').emit('game::list::update', partyJson);
  }
}
