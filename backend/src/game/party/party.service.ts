import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Clock } from 'three';  // @TODO : should find a lighter technologie
import { bounceBall, serverState, team, teamNoneVal, partyQuery } from 'src/common/game/logic/common';
import maps from 'src/common/game/maps/headless';
import { Party, partyStatus, pauseReason, map, Query } from './interfaces/party.interface';
import type { Socket } from 'socket.io';

@Injectable()
export class PartyService
{
    private parties: Party[] = [];
    private partiesBySocket: any = {};
    private queries: Query[] = [];

    run(party: Party, delta: number)
    {
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

    onFinish(party: Party, state: serverState)
    {
        party.status = partyStatus.Finish;
        this.patchState(
            party,
            {
                text: '',
                textSize: 0.5,
                textColor: 0x0000ff,
                ball: true,
                offside: false,
                lobby: true,
                paused: false,
                ballX: 0.5,
                ballY: 0.5,
                ballSpeedX: 0,
                ballSpeedY: 1
            }
        );

        let winnerSlot = party.state.scores[0] == 11 ? 0 : 1;
        let looserSlot = winnerSlot == 0 ? 1 : 0;

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

    onOffside (party: Party, state: serverState)
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
            this.onFinish(party, state);
        else
        {
            party.statusData.previousStatus = partyStatus.IntroducingSleeve;
            this.play(party);
        }
    }

    findParty (room: string): Party | null
    {
        return (this.parties.find(({room: partyRoom}) => (partyRoom == room)) || null);
    }

    findPartyFromSocket(client: Socket): Party | null
    {
        return (this.partiesBySocket[client.id] || null);
    }

    sendError(e, client: Socket)
    {
        let message;
  
        if (e && typeof e === 'object' && 'message' in e)
            message = e.message;
        else
            message = e + '';
  
        this.sendSocketState(client, {
            ballSpeedX: 0,
            ballSpeedY: 0,
            text: message,
            textSize: 0.25,
            textColor: 0xff0000
        }, 0);
    }

    sendSocketState (client: Socket | null, state: Partial<serverState>, team: team | undefined)
    {
        if (!client)
            return ;
        if (typeof team != 'undefined')
            client.emit("party::state", (Object.assign({team}, state)));
        else
            client.emit("party::state", state);
    }

    sendState (party: Party, state: Partial<serverState>, sendFull: boolean = false)
    {
        let stateToSend = sendFull ? Object.assign(party.state, state) : state;

        if (party.playersSocket[0])
            this.sendSocketState(party.playersSocket[0], stateToSend, sendFull ? 0 : undefined);
        if (party.playersSocket[1])
            this.sendSocketState(party.playersSocket[1], stateToSend, sendFull ? 1 : undefined);
    }

    setState (party: Party, state: Partial<serverState>)
    {
        party.state = Object.assign(party.state, state);
    }

    patchState (party: Party, state: Partial<serverState>, sendFull: boolean = false)
    {
        this.setState(party, state);
        this.sendState(party, state, sendFull);
    }

    getNumberInRange(min, max) { 
        return Math.random() * (max - min) + min;
    }

    introduceBall (party: Party)
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
    }

    retake(party: Party)
    {
        switch (party.statusData.previousStatus) {
            case partyStatus.IntroducingSleeve:
                this.introduceBall(party);
                break;

            case partyStatus.Running:
                let { ballSpeedX, ballSpeedY, ballX, ballY, players } = party.state;
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
                        ballSpeedX, ballSpeedY, ballX, ballY, players
                    }
                );
                party.status = partyStatus.Running;            
                break;
        
            default:
                console.warn("Should never happen");
                break;
        }
        party.clock.getDelta();
    }

    pause (party: Party, reason: pauseReason)
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
                },
                true
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
                players: party.state.players
            }
        )
        if (party.status != partyStatus.Paused)
        {
            if (party.status != partyStatus.Warmup)
                party.statusData.previousStatus = party.status;
            party.status = partyStatus.Paused;
        }
        party.playersReady = [false, false];
    }

    getSlotFromSocket (party: Party, client: Socket): -1 | 0 | 1
    {
        if (party.playersSocket[0] && party.playersSocket[0].id == client.id)
            return 0;
        else if (party.playersSocket[1] && party.playersSocket[1].id == client.id)
            return 1;
        else
            return -1;
    }

    move(position: number, client: Socket)
    {
        const party = this.findPartyFromSocket(client);

        if (!party || party.status == partyStatus.Paused)
            return ;
        let slot = this.getSlotFromSocket(party, client);

        if (slot == -1)
            return ;
        
        let newPlayerPosition = party.state.players.slice() as [number, number];
        newPlayerPosition[slot] = position;
        let newState = { players: newPlayerPosition };
        this.setState(party, newState);
        this.sendSocketState(party.playersSocket[slot == 0 ? 1 : 0], newState, undefined);
    }

    leaveAll (client: Socket)
    {
        const party = this.findPartyFromSocket(client);

        if (party)
        {
            let slot = this.getSlotFromSocket(party, client);

            if (slot == -1)
            {
                console.warn("partiesBySocket referenced a party which doesn't contains the socket");
                return ;
            }

            party.playersSocket[slot] = null;
            party.playersReady[slot] = false;
            delete this.partiesBySocket[client.id];

            // should make avatar grayscale

            this.pause(party, pauseReason.Leave);
        }
    }

    joinParty (party: Party, client: Socket): Party
    {
        const userId: string = "userIdB";

        this.leaveAll(client);

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

        party.playersId[slot] = userId;
        party.playersSocket[slot] = client;
        this.partiesBySocket[client.id] = party;

        if (party.playersSocket[0] && party.playersSocket[1])
        {
            if (party.status == partyStatus.AwaitingPlayer)
            {
                party.status = partyStatus.Paused;
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
                )
            }
            else
                this.pause(party, pauseReason.Regain);
        }
        else
        {
            this.patchState(
                party,
                {},
                true
            )
        }
        
        
        return (party);
    }

    createParty (room: string, map: map, client?: Socket): Party
    {
        let party = this.findParty(room);

        if (party)
        {
            if (party.map != map)
            {
                this.sendError("Party exists with a different map", client);
                return;
            }
            if (party.playersSocket[0] && party.playersSocket[1] && !party.playersSocket.includes(client))
            {
                this.sendError("Party exists but is already full", client);
                return;
            }
            return client ? this.joinParty(party, client) : party;
        }
        else
        {
            party = {
                room,
                map,
                clock: new Clock(),
                status: partyStatus.AwaitingPlayer,
                statusData: {
                    since: new Date(),
                    counter: 0,
                    previousStatus: partyStatus.IntroducingSleeve
                },
                wonSleeve: teamNoneVal,
                playersSocket: [client || null, null],
                playersId: ["userIdA", null],
                playersReady: [false, false],
                state: {
                    players: [0.5, 0.5],
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
                    avatars: [null, null]
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
                true
            );

            this.wireMatchingQuery(party);

            return (party);
        }
    }

    play (party: Party)
    {
        party.status = partyStatus.Warmup;
        party.statusData.since = new Date();
        party.statusData.counter = 0;
        this.patchState(
            party,
            {
                lobby: false,
                text: '3',
                textSize: 1,
                textColor: 0x00ffff,
            }
        );
    }

    click (client: Socket)
    {
        const party = this.findPartyFromSocket(client);

        if (!party)
            return ;
        let slot = this.getSlotFromSocket(party, client);
        
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
    
    @Interval(1000/30)
    handleInterval()
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

    find ({map}: partyQuery): string | null
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

    queryParty (client: Socket, query: partyQuery)
    {
        this.queries.push({
            client,
            query
        });
    }

    leaveAllQuery (client: Socket)
    {
        this.queries = this.queries.filter(
            ({client: partyClient}) => (client != partyClient)
        );
    }

    wireMatchingQuery (party: Party)
    {
        if (party.playersId[0] && party.playersId[1]) // @TODO: Should check that's the place is not reserved to the querier
            return ;

        this.queries.every(
            ({client, query}) =>
            {
                if ((!query.map || query.map == party.map))
                {
                    client.emit('play::found', party.room);
                    this.leaveAll(client);
                    return (false);
                }
                return (true);
            }
        );
    }
}