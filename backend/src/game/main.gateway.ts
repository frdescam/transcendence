import { UseGuards, Request } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { map } from './interface';
import { PartyService } from './party/party.service';
import type { Socket, Server } from 'socket.io';
import type { userId } from 'src/common/game/types';
import type { Pong, partyQuery } from 'src/common/game/interfaces';
import { getPartyDto } from 'src/common/game/orm/getParty.dto';
import { SocketMockupAuthGuard } from 'src/usermockup/auth.guard';
import { WsJwtGuard } from "src/auth/guards/ws-jwt.guard"; // erase WS strategy not needed here


@WebSocketGateway({
  namespace: 'game',
  // cors: '*:*',
  cors: {
    origin: '*',
    //allowedHeaders: ["Authentication"],
    //credentials: true,
  },
})
export class MainGateway
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

  @UseGuards(WsJwtGuard)
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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('party::join')
  join(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
    @Request() req,
  ): void
  {
    const party = this.partyService.findParty(room);
    const user: any = req.user;
    const userId: userId = user.id;
    //console.log(user);

    if (party)
      this.partyService.joinParty(party, client, userId);
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
    console.log(user, party);

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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('game::query::find')
  query(
    @ConnectedSocket() client: Socket,
    @Request() req,
    @MessageBody('map') map?: string,
    @MessageBody('map') adversary?: userId,
  ): void
  {
    const user: any = req.user;
    this.partyService.checkUserObject(user);
    const userId: userId = user.id;
    const query: partyQuery = {map, adversary, requester: userId};

    const party = this.partyService.find(query);

    if (party && !this.partyService.queryFoundParty(client, party, userId))
    {
      client.emit('game::query::notFound');
      this.partyService.queryParty(client, query);
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
