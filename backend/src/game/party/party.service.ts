import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { nanoid } from 'nanoid';
import { Clock } from 'three';  // @TODO : should find a lighter technologie
import { MatchService } from 'src/match/match/match.service';
import { UserService } from 'src/user/user/user.service';
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

@Injectable()
export class PartyService
{
    private parties: Party[] = [];
    private partiesBySocket: any = {};
    private queries: Query[] = [];
    private onListChange: listChangeCallback | null = null;

    constructor (
      private readonly userService: UserService,
      private readonly matchService: MatchService,
    )
    {}

    public checkUserObject(user: any)
    {
        if (!user || typeof user.id != 'number')
            throw "Authentification is required for that function";
    }

    private getNumberInRange(min, max) { 
        return Math.random() * (max - min) + min;
    }

    public getSlotFromSocket (party: Party, client: Socket): -1 | 0 | 1
    {
        if (party.playersSocket[0] && party.playersSocket[0].id == client.id)
            return 0;
        else if (party.playersSocket[1] && party.playersSocket[1].id == client.id)
            return 1;
        else
            return -1;
    }

    public getSlotFromUser (party: Party, userId: userId): -1 | 0 | 1
    {
        if (party.playersId[0] && party.playersId[0] == userId)
            return 0;
        else if (party.playersId[1] && party.playersId[1] == userId)
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
            if (typeof winnerSlot != 'undefined' && typeof looserSlot != 'undefined')
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
                        ballX: 0.5,
                        ballY: 0.5,
                        ballSpeedX: 0,
                        ballSpeedY: 1,
                        finish: true
                    }
                );
        
                this.setState(
                    party,
                    {
                        text: 'Saving...',
                        textSize: 0.8,
                        textColor: 0x0000ff,
                    }
                )

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
                )
        
                if (party.playersSocket[winnerSlot])
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
                if (party.playersSocket[looserSlot])
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
                        ballSpeedX: 0,
                        ballSpeedY: 0,
                        finish: true
                    },
                    true,
                    true
                );
            }

            setTimeout(this.removeParty.bind(this, party), 10*1000);
        }
        catch (e)
        {
            this.setState(
                party,
                {
                    text: 'Failed to save the score',
                    textSize: 0.8,
                    textColor: 0xff0000,
                }
            );
            setTimeout(this.removeParty.bind(this, party), 24*60*60*1000);
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
        if (Math.max(party.state.scores[0], party.state.scores[1]) == 11)
            this.onFinish(party, party.state.scores[0] == 11 ? 0 : 1, party.state.scores[0] == 11 ? 1 : 0);
        else
        {
            party.statusData.previousStatus = partyStatus.IntroducingSleeve;
            this.play(party);
        }
    }

    private handleListChange(party: Party, newState: Partial<serverState>, force: boolean = false)
    {
        let changed = force;

        if (!this.onListChange)
            return ;
        if (!changed && ('avatars' in newState || 'scores' in newState || 'finish' in newState))
            changed = true;
        
        const mutedParty: Party = {
            ...party,
            state: Object.assign({}, party.state, newState)
        };

        this.onListChange(
            this.partyToPublicJson(mutedParty)
        )
    }

    public setOnListChange(callback: listChangeCallback | null)
    {
        this.onListChange = callback;
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
    
    @Interval(1000/30)
    private handleInterval()
    {
        // only send update on nonpredictable action like bounce along player pos at the bounce (, player move [it's already sent along event]), ... (but not ball position if it's a simple forward)

        this.parties.forEach(party =>
        {
            const delta = party.clock.getDelta();

            switch (party.status) {
                case partyStatus.Warmup:
                    let now = new Date();
                    let elapsedSeconds = Math.floor((now.getTime() - party.statusData.since.getTime()) / 1000);
                    if (party.statusData.counter != elapsedSeconds)
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
        });
    }

    public sendError(e, client: Socket)
    {
        let message;
  
        if (e && typeof e === 'object' && 'message' in e)
            message = e.message + '';
        else
            message = e + '';
  
        client.emit('party::error', message);
    }

    private sendSocketState (client: Socket | null, state: Partial<serverState>, team: team | undefined)
    {
        if (!client)
            return ;
        if (typeof team != 'undefined')
            client.emit("party::state", (Object.assign({team}, state)));
        else
            client.emit("party::state", state);
    }

    private sendState (party: Party, state: Partial<serverState>, sendFull: boolean = false, sendTeam: boolean = false)
    {
        let stateToSend = sendFull ? Object.assign({}, party.state, state) : state;

        if (party.status != partyStatus.Running && sendFull)
            stateToSend = Object.assign(stateToSend, {ballSpeedX: 0, ballSpeedY: 0});

        if (party.playersSocket[0])
            this.sendSocketState(party.playersSocket[0], stateToSend, sendTeam ? 0 : undefined);
        if (party.playersSocket[1])
            this.sendSocketState(party.playersSocket[1], stateToSend, sendTeam ? 1 : undefined);
        
        party.spectators.forEach(
            (spectator) =>
            {
                this.sendSocketState(spectator, stateToSend, undefined);
            }
        );

        this.handleListChange(party, state);
    }

    private setState (party: Party, state: Partial<serverState>)
    {
        party.state = Object.assign(party.state, state);
    }

    private patchState (party: Party, state: Partial<serverState>, sendFull: boolean = false, sendTeam: boolean = false)
    {
        this.setState(party, state);
        this.sendState(party, state, sendFull, sendTeam);
    }

    private introduceBall (party: Party)
    {
        let ballDirection;
        let ballAngle = this.getNumberInRange(-Math.PI / 4, Math.PI / 4);
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
                ballX: 0.5,
                ballY: 0.5,
                ballSpeedX: Math.cos(ballAngle) * ballDirection,
                ballSpeedY: Math.sin(ballAngle)
            }
        );
        this.handleListChange(party, {}, true);
    }

    private retake (party: Party)
    {
        switch (party.statusData.previousStatus) {
            case partyStatus.IntroducingSleeve:
            case partyStatus.AwaitingPlayer:
                this.introduceBall(party);
                break;

            case partyStatus.Running:
                let { ballSpeedX, ballSpeedY, ballX, ballY, positions } = party.state;
                this.patchState(
                    party,
                    {
                        text: '',
                        paused: false,
                    }
                );
                this.sendState(
                    party,
                    {
                        ballSpeedX, ballSpeedY, ballX, ballY, positions
                    }
                );
                party.status = partyStatus.Running;      
                this.handleListChange(party, {}, true);      
                break;
        
            default:
                console.warn("Should never happen");
                break;
        }
        party.clock.getDelta();
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
                text: '3',
                textSize: 1,
                textColor: 0x00ffff,
            }
        );
        this.handleListChange(party, {}, true);
    }

    public pause (party: Party, reason: pauseReason)
    {
        if (party.status == partyStatus.Running)
        {
            let delta = party.clock.getDelta();
            this.run(party, delta);
        }

        if (party.status != partyStatus.Warmup
                && party.status != partyStatus.Running
                && party.status != partyStatus.IntroducingSleeve
                && party.status != partyStatus.Paused)
            return ;

        if (reason == pauseReason.Leave)
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
        else if (reason == pauseReason.Regain)
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
        else if (reason == pauseReason.Explicit)
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
                ballSpeedX: 0,
                ballSpeedY: 0,
                ballX: party.state.ballX,
                ballY: party.state.ballY,
                positions: party.state.positions
            },
            false,
            true
        )
        if (party.status != partyStatus.Paused)
        {
            if (party.status != partyStatus.Warmup)
                party.statusData.previousStatus = party.status;
            party.status = partyStatus.Paused;
            this.handleListChange(party, {}, true);
        }
        party.playersReady = [false, false];
    }

    public move (position: number, client: Socket)
    {
        const party = this.findPartyFromSocket(client);

        if (!party || party.status == partyStatus.Paused)
            return ;
        let slot = this.getSlotFromSocket(party, client);

        if (slot == -1)
            return ;
        
        let newPlayerPosition = party.state.positions.slice() as [number, number];
        newPlayerPosition[slot] = position;
        let newState = { positions: newPlayerPosition };
        this.setState(party, newState);
        this.sendSocketState(party.playersSocket[slot == 0 ? 1 : 0], newState, undefined);
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
        let slot = this.getSlotFromSocket(party, client);

        if (slot == -1)
            return ;
        
        if (party.status == partyStatus.Paused)
        {
            party.playersReady[slot] = !party.playersReady[slot];
            if (party.playersReady[0] && party.playersReady[1])
                this.play(party);
            else if (party.playersReady[slot])
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
        let slot = this.getSlotFromSocket(party, client);

        if (slot == -1)
            return ;

        this.pause(party, pauseReason.Explicit);
    }

    public admitDefeat (party: Party, slot: 0 | 1)
    {
        if (party.status == partyStatus.Finish)
            return ;
        
        if (party.status == partyStatus.AwaitingPlayer
            || (party.statusData.previousStatus == partyStatus.AwaitingPlayer && party.status == partyStatus.Paused))
            this.onFinish(party, undefined, undefined);
        else
            this.onFinish(party, slot == 0 ? 1 : 0, slot);
    }

    public leaveAll (client: Socket)
    {
        const party = this.findPartyFromSocket(client);

        if (party)
        {
            let slot = this.getSlotFromSocket(party, client);

            if (slot == -1)
            {
                party.spectators = party.spectators.filter((socket) => (socket != client));
                delete this.partiesBySocket[client.id];
                return ;
            }

            party.playersSocket[slot] = null;
            party.playersReady[slot] = false;
            delete this.partiesBySocket[client.id];

            this.patchState(
                party,
                {
                    presences: this.getPresences(party)
                }
            )

            this.pause(party, pauseReason.Leave);
        }
    }

    public joinParty (party: Party, client: Socket, user: any): Party
    {
        this.checkUserObject(user);
        const userId: userId = user.id;

        let slot;
        if (party.playersId[0] && party.playersId[0] != userId)
        {
            if (party.playersId[1] && party.playersId[1] != userId)
            {
                this.sendError("Party is already full", client);
                return;
            }
            else
                slot = 1;
        }
        else
            slot = 0;
        
        if (party.playersSocket[slot])
        {
            this.sendError("You are already playing in another window", client);
            return;
        }

        this.leaveAll(client);


        party.playersId[slot] = userId;
        party.playersSocket[slot] = client;
        this.partiesBySocket[client.id] = party;

        if (party.playersSocket[0] && party.playersSocket[1])
        {
            if (party.status == partyStatus.AwaitingPlayer)
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

                this.handleListChange(party, {}, true);
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
        )
        
        return (party);
    }

    public spectateParty (party: Party, client: Socket, user: any): Party
    {
        client.emit("party::mapinfo", party.map);
        this.sendSocketState(client, party.state, undefined);
        if (user)
        {
            this.checkUserObject(user);
            const userId: userId = user.id;

            let slot;
            if ((slot = this.getSlotFromUser(party, userId)) != -1)
            {
                if (!party.playersSocket[slot])
                {
                    this.joinParty(party, client, user);
                    return (party);
                }
            }
        }
        
        party.spectators.push(client);
        this.partiesBySocket[client.id] = party;

        return (party);
    }
    
    public createParty (room: string | null, map: map | null = "classic", userIds: [userId, userId | null], client?: Socket, user?: any): Party
    {
        let party = room && this.findParty(room);
        let involvedParty = this.findPartyWithUser(userIds[0])

        if (!room)
            room = nanoid();
        if (!(map in maps))
            throw new HttpException("Unknown map", HttpStatus.NOT_FOUND);
        
        if (room == "mine")
            throw new HttpException("This party name is special and cannot be used", HttpStatus.CONFLICT);
        else if (party)
        {
            if (party.map != map)
                throw new HttpException("Party exists with a different map", HttpStatus.CONFLICT);
            if (party.playersSocket[0] && party.playersSocket[1] && !party.playersSocket.includes(client))
                throw new HttpException("Party exists but is already full", HttpStatus.CONFLICT);
            return (client && user) ? this.joinParty(party, client, user) : party;
        }
        else if (involvedParty)
        {
            throw new HttpException("You are already involved in another party in room " + involvedParty.room, HttpStatus.FORBIDDEN);
        }
        else if (userIds[1] && this.findPartyWithUser(userIds[1]))
        {
            throw new HttpException("Adversary is already involved in another party", HttpStatus.FORBIDDEN);
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
                playersReady: [false, false],
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
                    text: '',
                    textSize: 0.5,
                    textColor: 0xff0000,
                    avatars: [null, null],
                    presences: [!!client, false],
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
                    textColor: 0xffff00
                },
                false,
                true
            );

            this.handleListChange(party, {}, true);
            this.wireMatchingQuery(party);

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
        return (this.parties.find(({room: partyRoom}) => (partyRoom == room)) || null);
    }

    public findPartyFromSocket(client: Socket): Party | null
    {
        return (this.partiesBySocket[client.id] || null);
    }

    public findPartyWithUser (userId: userId): Party | null
    {
        return (this.parties.find(({playersId}) => (playersId[0] == userId || playersId[1] == userId)) || null);
    }

    public getAll(): Party[]
    {
        return (this.parties);
    }

    public find ({map}: partyQuery): string | null
    {
        const candidates = this.parties.filter(
            (party) =>
            {
                if (map && party.map != map)
                    return (false);
                return (true);
            }
        );

        if (candidates.length)
            return (candidates[0].room);
        else
            return (null);
    }

    private isQueryCompatible (query1: partyQuery, query2: partyQuery): boolean
    {
        // @TODO also use socket to test "player=" criteria

        if (query1.map && query2.map)
            if (query1.map != query2.map)
                return (false);
        
        return (true);
    }

    private createPartyForQuery (query1: partyQuery, query2: partyQuery): Party
    {
        const map = query1.map || query2.map || null;

        // @TODO: Get userId from sockets
        const party = this.createParty(null, map, [1, 2]);

        return (party);
    }

    public queryParty (client: Socket, query: partyQuery)
    {
        // @TODO: manage error: eg: disallow if involved in other party (or auto give-up)

        const hasToCreateQuery = this.queries.every(
            ({client: testedClient, query: testedQuery}) =>
            {
                if (this.isQueryCompatible(query, testedQuery))
                {
                    const party = this.createPartyForQuery(query, testedQuery);

                    client.emit('game::query::found', party.room);
                    testedClient.emit('game::query::found', party.room);
                    this.leaveAll(testedClient);
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
            ({client: partyClient}) => (client != partyClient)
        );
    }

    public wireMatchingQuery (party: Party)
    {
        if (party.playersId[0] && party.playersId[1]) // @TODO: Should check that's the place is not reserved to the querier
            return ;

        this.queries.every(
            ({client, query}) =>
            {
                if ((!query.map || query.map == party.map))
                {
                    client.emit('game::query::found', party.room);
                    this.leaveAll(client);
                    return (false);
                }
                return (true);
            }
        );
    }

    public statusToString (status: partyStatus): string
    {
        switch (status) {
            case partyStatus.AwaitingPlayer:
                return "awaiting-player";
            case partyStatus.Warmup:
                return "warmup";
            case partyStatus.Paused:
                return "paused";
            case partyStatus.IntroducingSleeve:
                return "introducing-sleeve";
            case partyStatus.Running:
                return "running";
            case partyStatus.Finish:
                return "finish"
                break;
                    
            default:
                return "unknown";
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