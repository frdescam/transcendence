import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { nanoid } from 'nanoid';
import { Clock } from 'three';
import { MatchService } from 'src/match/match/match.service';
import { UserService } from 'src/users/user/user.service';
import { getPartyDto } from 'src/common/game/orm/getParty.dto';
import { bounceBall } from 'src/common/game/logic';
import { teamEnum } from 'src/common/game/types';
import maps from 'src/common/game/maps';
import { Party, partyStatus, pauseReason, map, Query } from '../interface';
import type { serverState, partyQuery } from 'src/common/game/interfaces';
import type { team, userId } from 'src/common/game/types';
import type { Socket } from 'socket.io';
import type { MatchRegistrationDto } from 'src/match/orm/registration.dto';

export type listChangeCallback = (partyJson: getPartyDto) => void;
export type userStatusChangeCallback = (userId: userId, partyJson: getPartyDto | null) => void;

@Injectable()
export class PartyService
{
	private parties: Party[] = [];
	private partiesBySocket: any = {};
	private queries: Query[] = [];
	private onListChange: listChangeCallback | null = null;
	private onUserStatusChange: userStatusChangeCallback | null = null;

	constructor (
			private readonly userService: UserService,
			private readonly matchService: MatchService,
	)
	{}

	public checkUserObject(user: any)
	{
		if (typeof user !== 'object' || typeof user?.id !== 'number')
			throw 'Authentification is required for that function';
	}

	private getNumberInRange(min, max) { 
		return Math.random() * (max - min) + min;
	}

	public getSlotFromSocket (party: Party, client: Socket): -1 | 0 | 1
	{
		if (!!party.playersSocket[0] && party.playersSocket[0].id === client.id)
			return 0;
		else if (!!party.playersSocket[1] && party.playersSocket[1].id === client.id)
			return 1;
		else
			return -1;
	}

	public getSlotFromUser (party: Party, userId: userId): -1 | 0 | 1
	{
		if (typeof party.playersId[0] == 'number' && party.playersId[0] === userId)
			return 0;
		else if (typeof party.playersId[1] == 'number' && party.playersId[1] === userId)
			return 1;
		else
			return -1;
	}

	private getPresences (party: Party): [boolean, boolean]
	{
		return ([!!party.playersSocket[0], !!party.playersSocket[1]]);
	}

	private async saveScore(map: string, userHomeId: userId, userForeignId: userId, winnerId: userId, userHomeScore: number, userForeignScore: number)
	{
		const userHome = await this.userService.getOne(userHomeId);
		const userForeign = await this.userService.getOne(userForeignId);
		const winner = await this.userService.getOne(winnerId);
				
		const matchData: MatchRegistrationDto = {
			map,
			userHome,
			userForeign,
			winner,
			userHomeScore,
			userForeignScore
		};
		await this.matchService.create(matchData);
	}

	private async onFinish(party: Party, winnerSlot?: 1 | 0, looserSlot?: 1 | 0)
	{
		party.status = partyStatus.Finish;
		try
		{
			if (typeof winnerSlot !== 'undefined' && typeof looserSlot !== 'undefined')
			{
				this.patchState(
					party,
					{
						text: '',
						textSize: 0.5,
						textColor: 0x0000ff,
						ball: true,
						offside: false,
						lobby: true,
						paused: true,
						frozen: true,
						ballX: 0.5,
						ballY: 0.5,
						ballSpeedX: 0,
						ballSpeedY: 1,
						finish: true
					}
				);
				
				this.patchState(
					party,
					{
						text: 'Saving...',
						textSize: 0.8,
						textColor: 0x0000ff,
					}
				);

				await this.saveScore(
					party.map,
					party.playersId[0],
					party.playersId[1],
					party.playersId[winnerSlot],
					party.state.scores[0],
					party.state.scores[1]
				);

				this.setState(
					party,
					{
						text: 'Player ' + (winnerSlot + 1) + ' won !',
						textSize: 0.9,
						textColor: 0x0000ff,
					}
				);
				
				if (!!party.playersSocket[winnerSlot])
				{
					this.sendSocketState(
						party.playersSocket[winnerSlot],
						{
							text: 'You won !',
							textSize: 1,
							textColor: 0x00ff00,
						},
						undefined
					);
				}
				if (!!party.playersSocket[looserSlot])
				{
					this.sendSocketState(
						party.playersSocket[looserSlot],
						{
							text: 'You lost !',
							textSize: 1,
							textColor: 0xff0000,
						},
						undefined
					);
				}

				try
				{
					await this.userService.updateUserStats(party.playersId[0]);
					await this.userService.updateUserStats(party.playersId[1]);
				}
				catch (e)
				{
					this.patchState(
						party,
						{
							text: 'Failed to update XP',
							textSize: 0.8,
							textColor: 0xff0000,
						}
					);
					for (let index = 0; index < 2; index++)
						party.playersSocket[index]?.emit('party::error', 'Failed to update XP');
				}

				setTimeout(this.removeParty.bind(this, party), 10*1000);
			}
			else
			{
				this.patchState(
					party,
					{
						text: 'Party canceled',
						textSize: 0.5,
						textColor: 0xff8030,
						ball: false,
						offside: false,
						lobby: true,
						paused: true,
						frozen: true,
						ballSpeedX: 0,
						ballSpeedY: 0,
						finish: true
					},
					true,
					true
				);
				this.removeParty(party);
			}

		}
		catch (e)
		{
			this.patchState(
				party,
				{
					text: 'Failed to save the score',
					textSize: 0.8,
					textColor: 0xff0000,
				}
			);
			setTimeout(this.removeParty.bind(this, party), 60*1000);
			for (let index = 0; index < 2; index++)
				party.playersSocket[index]?.emit('party::error', 'Failed to save the score');
		}

	}

	private onOffside (party: Party, state: serverState)
	{
		const {offside, ballX, ballY, ballSpeedX, ballSpeedY, scores} = state;
		this.sendState(
			party,
			{
				offside,
				ballX,
				ballY,
				ballSpeedX,
				ballSpeedY,
				scores
			}
		);
		if (Math.max(party.state.scores[0], party.state.scores[1]) === 11)
			this.onFinish(party, party.state.scores[0] === 11 ? 0 : 1, party.state.scores[0] === 11 ? 1 : 0);
		else
		{
			party.statusData.previousStatus = partyStatus.IntroducingSleeve;
			this.play(party);
		}
	}

	private handlePartyChange(party: Party, newState: Partial<serverState>, force = false)
	{
		let changed = force;

		if (!this.onListChange && !this.onUserStatusChange)
			return ;
		if (!changed && ('avatars' in newState || 'scores' in newState || 'finish' in newState))
			changed = true;
				
		const mutedParty: Party = {
			...party,
			state: Object.assign({}, party.state, newState)
		};

		if (this.onListChange)
			this.onListChange( this.partyToPublicJson(mutedParty) );
		if (this.onUserStatusChange)
		{
			if (typeof party.playersId[0] === 'number')
				this.onUserStatusChange( party.playersId[0], this.partyToPublicJson(mutedParty) );
			if (typeof party.playersId[1] === 'number')
				this.onUserStatusChange( party.playersId[1], this.partyToPublicJson(mutedParty) );
		}
	}

	public setOnListChange(callback: listChangeCallback | null)
	{
		this.onListChange = callback;
	}

	public setOnUserStatusChange(callback: userStatusChangeCallback | null)
	{
		this.onUserStatusChange = callback;
	}

	private run(party: Party, delta: number)
	{
		const date = new Date();

		bounceBall(
			party.state,
			maps[party.map],
			delta,
			(state) =>
			{
				state.scores[1] += 1;
				party.wonSleeve = 1;
				this.onOffside(party, state);
			},
			(state) =>
			{
				state.scores[0] += 1;
				party.wonSleeve = 0;
				this.onOffside(party, state);
			},
			({offside, ballX, ballY, ballSpeedX, ballSpeedY, scores}) =>
			{
				this.sendState(
					party,
					{
						date: date.toISOString(),
						offside,
						ballX,
						ballY,
						ballSpeedX,
						ballSpeedY,
						scores
					}
				);
			}
		);
	}

	private runFrame(party: Party)
	{
		const delta = party.clock.getDelta();
		const now = new Date();
		const elapsedSeconds = Math.floor((now.getTime() - party.statusData.since.getTime()) / 1000);

		switch (party.status) {
		case partyStatus.Warmup:
			if (party.statusData.counter !== elapsedSeconds)
			{
				switch (elapsedSeconds) {
				case 1:
					this.patchState(
						party,
						{
							lobby: false,
							text: '2',
							textSize: 1,
							textColor: 0xff00ff,
						}
					);
					break;
				case 2:
					this.patchState(
						party,
						{
							lobby: false,
							text: '1',
							textSize: 1,
							textColor: 0xffff00,
						}
					);
					break;
				default:
					this.retake(party);
					break;
				}
				party.statusData.counter = elapsedSeconds;
			}
			break;
		case partyStatus.Running:
			this.run(party, delta);
			break;

		default:
			break;
		}
	}
		
	@Interval(1000/30)
	private handleInterval()
	{
		this.parties.forEach(this.runFrame.bind(this));
	}

	public sendError(e, client: Socket)
	{
		let message;

		if (!!e && typeof e === 'object' && 'message' in e)
			message = e.message + '';
		else
			message = e + '';

		client.emit('party::error', message);
	}

	private sendSocketState (client: Socket | null, state: Partial<serverState>, team: team | undefined, could_join?: boolean)
	{
		if (!client)
			return ;
		client.emit('party::state', (Object.assign({team, could_join}, state)));
	}

	private sendState (party: Party, state: Partial<serverState>, sendFull = false, sendTeam = false)
	{
		let stateToSend = sendFull ? Object.assign({}, party.state, state) : state;

		if (party.status !== partyStatus.Running && sendFull)
			stateToSend = Object.assign(stateToSend, {ballSpeedX: 0, ballSpeedY: 0});

		if (!!party.playersSocket[0])
			this.sendSocketState(party.playersSocket[0], stateToSend, sendTeam ? 0 : undefined);
		if (!!party.playersSocket[1])
			this.sendSocketState(party.playersSocket[1], stateToSend, sendTeam ? 1 : undefined);
			
		party.spectators.forEach(
			(spectator) =>
			{
				this.sendSocketState(spectator, stateToSend, undefined);
			}
		);

		this.handlePartyChange(party, state);
	}

	private setState (party: Party, state: Partial<serverState>)
	{
		party.state = Object.assign(party.state, state);
	}

	private patchState (party: Party, state: Partial<serverState>, sendFull = false, sendTeam = false)
	{
		this.setState(party, state);
		this.sendState(party, state, sendFull, sendTeam);
	}

	private introduceBall (party: Party)
	{
		const { speedFactor } = maps[party.map];
		let ballDirection;
		const ballAngle = this.getNumberInRange(-Math.PI / 4, Math.PI / 4);
		switch (party.wonSleeve)
		{
		case 0:
			ballDirection = 1;
			break;
		case 1:
			ballDirection = -1;
			break;
			
		default:
			ballDirection = Math.floor(Math.random() * 2) ? -1 : 1;
			break;
		}
		party.status = partyStatus.Running;
		this.patchState(
			party,
			{
				text: '',
				ball: true,
				offside: false,
				lobby: false,
				paused: false,
				frozen: false,
				ballX: 0.5,
				ballY: 0.5,
				ballSpeedX: Math.cos(ballAngle) * ballDirection * speedFactor,
				ballSpeedY: Math.sin(ballAngle) * speedFactor
			}
		);
		this.handlePartyChange(party, {}, true);
	}

	private retake (party: Party)
	{
		const { ballSpeedX, ballSpeedY, ballX, ballY, positions } = party.state;
		
		if (party.statusData.previousStatus === partyStatus.IntroducingSleeve ||
			party.statusData.previousStatus === partyStatus.AwaitingPlayer)
		{
			this.introduceBall(party);
		}
		else if (party.statusData.previousStatus === partyStatus.Running)
		{
			this.patchState(
				party,
				{
					text: '',
					paused: false,
					frozen: false,
				}
			);
			this.sendState(
				party,
				{
					ballSpeedX, ballSpeedY, ballX, ballY, positions
				}
			);
			party.status = partyStatus.Running;      
			this.handlePartyChange(party, {}, true);
		}
		else
			console.warn('Should never happen');
		party.clock.getDelta();
	}

	private shouldBeControlsFrozen(party: Party): boolean
	{
		return (
			party.status === partyStatus.Running
					|| party.statusData.previousStatus === partyStatus.Running
					|| party.status === partyStatus.Finish
		);
	}

	private updateAvatars(party, avatars: [string | null, string | null])
	{
		this.patchState(
			party,
			{
				avatars
			}
		);
	}

	private updateUserAvatar(party: Party, userId: userId, slot: 0 | 1)
	{
		this.userService.getOne(userId)
			.then(
				user =>
				{
					if (!user)
					{
						if (!!party.playersSocket[slot])
							this.sendError('Failed to retreive your avatar', party.playersSocket[slot]);
						return ;
					}
					const avatars = party.state.avatars.slice() as [string, string];
					avatars[slot] = user.avatar;
					this.updateAvatars(party, avatars);
				}
			)
			.catch(
				(e) =>
				{
					this.sendError(e, party.playersSocket[slot]);
				}
			);
	}

	public play (party: Party)
	{
		party.status = partyStatus.Warmup;
		party.statusData.since = new Date();
		party.statusData.counter = 0;
		this.patchState(
			party,
			{
				lobby: false,
				paused: false,
				frozen: this.shouldBeControlsFrozen(party),
				text: '3',
				textSize: 1,
				textColor: 0x00ffff,
				readyStates: [false, false]
			}
		);
		this.handlePartyChange(party, {}, true);
	}

	public pause (party: Party, reason: pauseReason)
	{
		if (party.status === partyStatus.Running)
			this.runFrame(party);

		if (party.status !== partyStatus.Warmup
							&& party.status !== partyStatus.Running
							&& party.status !== partyStatus.IntroducingSleeve
							&& party.status !== partyStatus.Paused)
			return ;

		if (reason === pauseReason.Leave)
		{
			this.patchState(
				party,
				{
					lobby: true,
					text: 'Adversary gone',
					textSize: 0.5,
					textColor: 0xff0000,
				}
			);
		}
		else if (reason === pauseReason.Regain)
		{
			this.patchState(
				party,
				{
					lobby: false,
					text: 'Ready to retake ?',
					textSize: 0.5,
					textColor: 0x0000ff,
				},
				true
			);
		}
		else if (reason === pauseReason.Explicit)
		{
			this.patchState(
				party,
				{
					lobby: false,
					text: 'Party paused',
					textSize: 0.5,
					textColor: 0x00ffff,
				}
			);
		}
		this.sendState(
			party,
			{
				paused: true,
				frozen: this.shouldBeControlsFrozen(party),
				ballSpeedX: 0,
				ballSpeedY: 0,
				ballX: party.state.ballX,
				ballY: party.state.ballY,
				positions: party.state.positions,
				readyStates: [false, false]
			},
			false,
			true
		);
		if (party.status !== partyStatus.Paused)
		{
			if (party.status !== partyStatus.Warmup)
				party.statusData.previousStatus = party.status;
			party.status = partyStatus.Paused;
			this.handlePartyChange(party, {}, true);
		}
	}

	public move (position: number, client: Socket)
	{
		const party = this.findPartyFromSocket(client);

		if (!party || party.state.frozen)
			return ;
		const slot = this.getSlotFromSocket(party, client);

		if (slot === -1)
			return ;
			
		this.runFrame(party);
			
		const newPlayerPosition = party.state.positions.slice() as [number, number];
		newPlayerPosition[slot] = position;
		const newState = { positions: newPlayerPosition };
		this.setState(party, newState);
		this.sendSocketState(party.playersSocket[slot === 0 ? 1 : 0], newState, undefined);
		party.spectators.forEach(
			(spectator) =>
			{
				this.sendSocketState(spectator, newState, undefined);
			}
		);
	}

	public click (client: Socket)
	{
		const party = this.findPartyFromSocket(client);

		if (!party)
			return ;
		const slot = this.getSlotFromSocket(party, client);

		if (slot === -1)
			return ;
			
		if (party.status === partyStatus.Paused)
		{
			if (!party.playersSocket[0] || !party.playersSocket[1])
				return ;
			const readyStates = party.state.readyStates.slice() as [boolean, boolean];
			readyStates[slot] = !readyStates[slot];
			this.patchState(
				party,
				{
					readyStates
				}
			);
			if (readyStates[0] && readyStates[1])
				this.play(party);
			else if (readyStates[slot])
			{
				this.sendSocketState(
					client,
					{
						lobby: false,
						text: 'Ready !',
						textSize: 0.75,
						textColor: 0x00ff00
					},
					undefined
				);
			}
			else
			{
				this.sendSocketState(
					client,
					{
						lobby: false,
						text: 'You are not ready',
						textSize: 0.5,
						textColor: 0xffff00
					},
					undefined
				);
			}
		}
		else
			this.pause(party, pauseReason.Explicit);
	}

	public pauseFromClient (client: Socket)
	{
		const party = this.findPartyFromSocket(client);

		if (!party)
			return ;
		const slot = this.getSlotFromSocket(party, client);

		if (slot === -1)
			return ;

		this.pause(party, pauseReason.Explicit);
	}

	public admitDefeat (party: Party, slot: 0 | 1): boolean
	{
		if (party.status === partyStatus.Finish)
			return (false);

		if (party.status === partyStatus.AwaitingPlayer
					|| (party.statusData.previousStatus === partyStatus.AwaitingPlayer && party.status === partyStatus.Paused))
			this.onFinish(party, undefined, undefined);
		else
			this.onFinish(party, slot === 0 ? 1 : 0, slot);

		return (true);
	}

	public leaveAll (client: Socket)
	{
		const party = this.findPartyFromSocket(client);

		if (party)
		{
			const slot = this.getSlotFromSocket(party, client);

			if (slot === -1)
			{
				party.spectators = party.spectators.filter((socket) => (socket !== client));
				delete this.partiesBySocket[client.id];
				return ;
			}

			party.playersSocket[slot] = null;
			party.state.readyStates[slot] = false;
			delete this.partiesBySocket[client.id];

			this.patchState(
				party,
				{
					presences: this.getPresences(party)
				}
			);

			this.pause(party, pauseReason.Leave);
		}
	}

	public joinParty (party: Party, client: Socket, userId: userId): Party | null
	{
		let slot;
		if (typeof party.playersId[0] === 'number' && party.playersId[0] !== userId)
		{
			if (typeof party.playersId[1] === 'number' && party.playersId[1] !== userId)
			{
				this.sendError('Party is already full', client);
				return (null);
			}
			else
				slot = 1;
		}
		else
			slot = 0;
			
		if (party.playersSocket[slot])
		{
			this.sendError('You are already playing in another window', client);
			return (null);
		}

		this.leaveAll(client);


		party.playersId[slot] = userId;
		party.playersSocket[slot] = client;
		this.partiesBySocket[client.id] = party;

		if (!!party.playersSocket[0] && !!party.playersSocket[1])
		{
			if (party.status === partyStatus.AwaitingPlayer)
			{
				party.status = partyStatus.Paused;
				party.statusData.previousStatus = partyStatus.AwaitingPlayer;
				this.patchState(
					party,
					{
						lobby: false,
						ball: false,
						text: 'Are you ready ?',
						textSize: 0.5,
						textColor: 0xff00ff,
						ballSpeedX: 0,
						ballSpeedY: 0,
					},
					true
				);

				this.handlePartyChange(party, {}, true);
			}
			else
				this.pause(party, pauseReason.Regain);
		}

		this.patchState(
			party,
			{
				presences: this.getPresences(party)
			},
			false,
			true
		);

		this.updateUserAvatar(party, userId, slot);

		return (party);
	}

	public spectateParty (party: Party, client: Socket, user: any): Party
	{
		client.emit('party::mapinfo', party.map);
		this.sendSocketState(client, party.state, undefined, !!user);  // @TODO: Check if is blocked
		if (!!user)
		{
			this.checkUserObject(user);
			const userId: userId = user.id;

			let slot;
			if ((slot = this.getSlotFromUser(party, userId)) !== -1)
			{
				if (!party.playersSocket[slot])
				{
					this.joinParty(party, client, userId);
					return (party);
				}
			}
		}
			
		party.spectators.push(client);
		this.partiesBySocket[client.id] = party;

		return (party);
	}
	
	public createParty (room: string | null, map: map | null | undefined, userIds: [userId, userId | null], client?: Socket, user?: any, disableInvitation?: boolean): Party
	{
		let party;
		const involvedParty = this.findPartyWithUser(userIds[0]);

		if (!room)
			room = nanoid();
		if (typeof map === 'undefined' || !map)
			map = 'classic';
		if (!(map in maps))
			throw new HttpException('Unknown map', HttpStatus.NOT_FOUND);
			
		if (room === 'mine')
			throw new HttpException('This party name is special and cannot be used', HttpStatus.CONFLICT);
		else if (involvedParty)
		{
			throw new HttpException('You are already involved in another party in room ' + involvedParty.room, HttpStatus.FORBIDDEN);
		}
		else if (typeof userIds[1] === 'number' && this.findPartyWithUser(userIds[1]))
		{
			throw new HttpException('Adversary is already involved in another party', HttpStatus.BAD_REQUEST);
		}
		else
		{
			party = {
				createdAt: new Date(),
				room,
				map,
				clock: new Clock(),
				status: partyStatus.AwaitingPlayer,
				statusData: {
					since: new Date(),
					counter: 0,
					previousStatus: partyStatus.IntroducingSleeve
				},
				wonSleeve: teamEnum.None,
				spectators: [],
				playersSocket: [client || null, null],
				playersId: userIds,
				state: {
					date: new Date(),
					positions: [0.5, 0.5],
					scores: [0, 0],
					ball: true,
					ballX: 0.5,
					ballY: 0.5,
					ballSpeedX: 1,
					ballSpeedY: 0,
					offside: false,
					lobby: true,
					paused: true,
					frozen: true,
					text: '',
					textSize: 0.5,
					textColor: 0xff0000,
					avatars: [user?.avatar || null, null],
					presences: [!!client, false],
					readyStates: [false, false],
					finish: false
				},
			};

			this.parties.push(party);
			if (client)
				this.partiesBySocket[client.id] = party;

			this.patchState(
				party,
				{
					lobby: true,
					text: 'Awaiting player...',
					textSize: 0.5,
					textColor: (party.playersId[0] && party.playersId[1]) ? 0xff00ff : 0xffff00
				},
				false,
				true
			);

			this.handlePartyChange(party, {}, true);

			if (typeof userIds[1] !== 'number')
				this.wireMatchingQuery(party);

			if (typeof userIds[1] === 'number' && (typeof disableInvitation === 'undefined' || disableInvitation === false))
			{
					/*
@TODO: Should send invitation to userIds[1]
The room is defined in `room` and the link is:
- On the client (vue-router): ```
router.resolve({
	name: 'party',
	params: {
		party: room
	}
}).href
```
- On the server, it had to be hardcoded: `/game/${room}`
					*/

				this.updateUserAvatar(party, userIds[1], 1);
			}

			return (party);
		}
	}

	private removeParty (party: Party)
	{
		for (let i = 0; i < this.parties.length; ++i)
		{ 
			if (this.parties[i] === party)
				this.parties.splice(i, 1); 
		}
	}

	public findParty (room: string): Party | null
	{
		return (this.parties.find(({room: partyRoom}) => (partyRoom === room)) || null);
	}

	public findPartyFromSocket(client: Socket): Party | null
	{
		return (this.partiesBySocket[client.id] || null);
	}

	public findPartyWithUser (userId: userId): Party | null
	{
		return (this.parties.find(({playersId}) => (playersId[0] === userId || playersId[1] === userId)) || null);
	}

	public getAll(): Party[]
	{
		return (this.parties);
	}

	public queryFoundParty(client: Socket, party: Party, userId: userId)
	{
		if (!party || !this.joinParty(party, client, userId))
			return (false);
		client.emit('game::query::found', party.room);
		this.leaveAll(client);
		return (true);
	}

	protected isPartyCompatibleWithQuery(party: Party, query: partyQuery): boolean
	{
		if (party.status === partyStatus.Finish)
			return (false);
		if (typeof party.playersId[0] == 'number' && typeof party.playersId[1] == 'number')
			if (party.playersId[0] !== query.requester && party.playersId[1] !== query.requester)
				return (false);
		if (typeof query.adversary === 'number' && party.playersId[0] !== query.adversary && party.playersId[1] !== query.adversary)
			return (false);
		if (typeof query.map === 'string' && party.map !== query.map)
			return (false);
		return (true);
	}

	private isQueryCompatible (query1: partyQuery, query2: partyQuery): boolean
	{
		if (typeof query1.adversary === 'number'  && query2.requester !== query1.adversary)
			return (false);
		if (typeof query2.adversary === 'number' && query1.requester !== query2.adversary)
			return (false);

		if (typeof query1.map === 'string' && typeof query2.map === 'string')
			if (query1.map !== query2.map)
				return (false);
			
		return (true);
	}

	public find (query: partyQuery): Party | null
	{
		const candidates = this.parties.filter(
			(party) => this.isPartyCompatibleWithQuery(party, query)
		);

		if (candidates.length)
			return (candidates[0]);
		else
			return (null);
	}

	private createPartyForQuery (query1: partyQuery, query2: partyQuery): Party
	{
		const map = query1.map ?? query2.map ?? undefined;

		const party = this.createParty(null, map, [query1.requester, query2.requester], undefined, undefined, true);

		return (party);
	}

	public queryParty (client: Socket, query: partyQuery)
	{
		const hasToCreateQuery = this.queries.every(
			({client: testedClient, query: testedQuery}) =>
			{
				if (this.isQueryCompatible(query, testedQuery))
				{
					const party = this.createPartyForQuery(query, testedQuery);

					this.queryFoundParty(client, party, query.requester);
					this.queryFoundParty(testedClient, party, testedQuery.requester);
					return (false);
				}
				return (true);
			}
		);

		if (hasToCreateQuery)
		{
			this.queries.push({
				client,
				query
			});
		}
	}

	public leaveAllQuery (client: Socket)
	{
		this.queries = this.queries.filter(
			({client: partyClient}) => (client !== partyClient)
		);
	}

	public wireMatchingQuery (party: Party)
	{
		this.queries.every(
			({client, query}) =>
			{
				if (this.isPartyCompatibleWithQuery(party, query))
					return (this.queryFoundParty(client, party, query.requester));
				return (true);
			}
		);
	}

	public statusToString (status: partyStatus): string
	{
		switch (status) {
		case partyStatus.AwaitingPlayer:
			return 'awaiting-player';
		case partyStatus.Warmup:
			return 'warmup';
		case partyStatus.Paused:
			return 'paused';
		case partyStatus.IntroducingSleeve:
			return 'introducing-sleeve';
		case partyStatus.Running:
			return 'running';
		case partyStatus.Finish:
			return 'finish';
			break;
									
		default:
			return 'unknown';
		}
	}

	public partyToPublicJson (party: Party): getPartyDto
	{
		const {createdAt, room, map, status, playersId, state: {avatars, scores, finish}} = party;

		return ({
			room,
			createdAt: createdAt.toISOString(),
			map,
			status: this.statusToString(status),
			players: playersId,
			avatars,
			scores,
			finish
		});
	}

	public getAllAsJSON(): getPartyDto[]
	{
		return (this.getAll().map(this.partyToPublicJson.bind(this)));
	}
}