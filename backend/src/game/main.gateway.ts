import { UseGuards, Request, UsePipes } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import cors from 'src/cors';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { WsJwtSpectateGuard } from 'src/auth/guards/ws-jwt-spectate.guard';
import { socketValidationPipe } from 'src/validation';
import { PartyService } from './party/party.service';
import { partyPingDto, partyJoinDto, partySpecateDto, partyMoveDto } from './orm/gatewayParty.dto';
import { queryFindDto } from './orm/gatewayQuery.dto';
import { userinfosDto } from './orm/gatewayUserinfos.dto';
import type { Socket, Server } from 'socket.io';
import type { userId } from 'src/common/game/types';
import type { Pong, partyQuery } from 'src/common/game/interfaces';
import type { getPartyDto } from 'src/common/game/orm/getParty.dto';
import type { getUserPartyDto } from 'src/common/game/orm/getUserParty.dto';

@WebSocketGateway({
	namespace: 'game',
	cors
})
@UsePipes(socketValidationPipe)
export class MainGateway implements OnGatewayDisconnect
{
	constructor(private partyService: PartyService)
	{
		partyService.setOnListChange(this.onListChange.bind(this));
		partyService.setOnUserStatusChange(this.onUserStatusChange.bind(this));
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
		@MessageBody() { cdate }: partyPingDto
	): void
	{
		client.volatile.emit(
			'party::pong',
			{
				cdate,
				sdate: (new Date()).toISOString()
			} as Pong
		);
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('party::join')
	join(
		@ConnectedSocket() client: Socket,
		@Request() req,
		@MessageBody() { room }: partyJoinDto
	): void
	{
		const party = this.partyService.findParty(room);
		const user: any = req.user;
		const userId: userId = user.id;

		if (party)
			this.partyService.joinParty(party, client, userId);
		else
			this.partyService.sendError('Party not found', client);
	}

	@UseGuards(WsJwtSpectateGuard)
	@SubscribeMessage('party::spectate')
	spectate(
		@ConnectedSocket() client: Socket,
		@Request() req,
		@MessageBody() { room }: partySpecateDto
	): void
	{
		const party = this.partyService.findParty(room);
		const user: any = req.user;

		if (party)
			this.partyService.spectateParty(party, client, user);
		else
			this.partyService.sendError('Party not found', client);
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
		@ConnectedSocket() client: Socket,
		@MessageBody() { position }: partyMoveDto
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
		if (slot === -1)
			return ({left: false});

		this.partyService.admitDefeat(party, slot);
		return ({left: true});
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('game::query::find')
	query(
		@ConnectedSocket() client: Socket,
		@Request() req,
		@MessageBody() { map, adversary }: queryFindDto,
	): void
	{
		const user: any = req.user;
		this.partyService.checkUserObject(user);
		const userId: userId = user.id;
		const query: partyQuery = {map, adversary, requester: userId};

		const party = this.partyService.find(userId, query);

		if (!party || !this.partyService.queryFoundParty(client, party, userId))
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

	@SubscribeMessage('game::userinfos::join')
	joinUserInfos(
		@ConnectedSocket() client: Socket,
		@MessageBody() { id: userId }: userinfosDto
	): void
	{
		client.join(`game::userinfos::${userId}`);
		const party = this.partyService.findPartyWithUser(userId);
		client.emit(
			'game::userinfos',
			{
				userId,
				party: party ? this.partyService.partyToPublicJson(party) : null
			} as getUserPartyDto
		);
	}

	@SubscribeMessage('game::userinfos::leave')
	leaveUserInfos(
		@ConnectedSocket() client: Socket,
		@MessageBody() { id: userId }: userinfosDto
	): void
	{
		client.leave(`game::userinfos::${userId}`);
	}

	public onUserStatusChange (userId: userId, partyJson: getPartyDto | null)
	{
		if (this.server)
		{
			this.server.to(`game::userinfos::${userId}`).emit(
				'game::userinfos',
				{
					userId,
					party: partyJson
				} as getUserPartyDto
			);
		}
	}
}
