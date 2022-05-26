import * as http from 'http';
import { Server } from "socket.io";
import { Clock } from 'three';
import { bounceBall, serverState, team } from './common';
import maps from '../maps/headless';

import type { Socket } from 'socket.io';

type map = string;

enum partyStatus
{
    AwaitingPlayer,
    Warmup,
    Paused,
    IntroducingSleeve,  // when we will intruduce the ball
    Running,
    Finish
}

enum pauseReason
{
    Explicit,
    Leave,
    Regain,
};

type party = {
    room: string,
    map: string,
    clock: Clock,
    status: partyStatus,
    statusData: {
        since: Date,
        counter: number,
        previousStatus: partyStatus
    },
    playersSocket: [Socket | null, Socket | null],
    playersId: [string | null, string | null],  // Also used to reserve the place
    playersReady: [boolean, boolean],
    state: serverState
};

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"]
    }
});

server.listen(3001, () => {
    console.log('listening on *:3001');
});

var parties: party[] = [];
var partiesBySocket: any = {}; // @TODO

function loop()
{
    // only send update on nonpredictable action like bounce along player pos at the bounce (, player move [it's already sent along event]), ... (but not ball position if it's a simple forward)

    // need delta time

    parties.forEach(party =>
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
                            patchState(
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
                            patchState(
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
                            retake(party);
                            break;
                    }
                }
                break;
            case partyStatus.Running:
                run(party, delta);
                break;
        
            default:
                break;
        }
    });
}

setInterval(loop, 1000/30);

function run(party: party, delta: number)
{
    bounceBall(
        party.state,
        maps[party.map],
        delta,
        (state) =>
        {
            state.scores[1] += 1;
            onOffside(party, state);
        },
        (state) =>
        {
            state.scores[0] += 1;
            onOffside(party, state);
        },
        ({offside, ballX, ballY, ballSpeedX, ballSpeedY, scores}) =>
        {
            sendState(
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

function onFinish(party: party, state: serverState)
{
    party.status = partyStatus.Finish;
    patchState(
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

    let winnerSlot = party.state.scores[0] == 10 ? 0 : 1;
    let looserSlot = winnerSlot == 0 ? 1 : 0;

    if (party.playersSocket[winnerSlot])
    {
        sendSocketState(
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
        sendSocketState(
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

function onOffside (party: party, state: serverState)
{
    const {offside, ballX, ballY, ballSpeedX, ballSpeedY, scores} = state;
    sendState(
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
    if (Math.max(party.state.scores[0], party.state.scores[1]) == 10)
        onFinish(party, state);
    else
    {
        party.statusData.previousStatus = partyStatus.IntroducingSleeve;
        play(party);
    }
}

function findParty (room: string): party | null
{
    return (parties.find(({room: partyRoom}) => (partyRoom == room)) || null);
}

function findPartyFromSocket(socket: Socket): party | null
{
    return (partiesBySocket[socket.id] || null);
}

function sendSocketState (socket: Socket, state: Partial<serverState>, team: team | undefined)
{
    socket.emit("game::state", (Object.assign({team}, state)));
}

function sendState (party: party, state: Partial<serverState>, includeTeam: boolean = false)
{
    if (party.playersSocket[0])
        sendSocketState(party.playersSocket[0], state, includeTeam ? 0 : undefined);
    if (party.playersSocket[1])
        sendSocketState(party.playersSocket[1], state, includeTeam ? 1 : undefined);
}

function setState (party: party, state: Partial<serverState>)
{
    party.state = Object.assign(party.state, state);
}

function patchState (party: party, state: Partial<serverState>, includeTeam: boolean = false)
{
    setState(party, state);
    sendState(party, state, includeTeam);
}

function introduceBall (party: party)
{
    party.status = partyStatus.Running;
    patchState(
        party,
        {
            text: '',
            ball: true,
            offside: false,
            lobby: false,
            paused: false,
            ballX: 0.5,
            ballY: 0.5,
            ballSpeedX: 1,
            ballSpeedY: 0
        }
    );
}

function retake(party: party)
{
    switch (party.statusData.previousStatus) {
        case partyStatus.IntroducingSleeve:
            introduceBall(party);
            break;

        case partyStatus.Running:
            let { ballSpeedX, ballSpeedY, ballX, ballY, players } = party.state;
            patchState(
                party,
                {
                    text: '',
                    paused: false,
                }
            );
            sendState(
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

function pause (party: party, reason: pauseReason)
{
    if (party.status == partyStatus.Running)
    {
        let delta = party.clock.getDelta();
        run(party, delta);
    }

    if (party.status != partyStatus.Warmup
            && party.status != partyStatus.Running
            && party.status != partyStatus.IntroducingSleeve
            && party.status != partyStatus.Paused)
        return ;

    if (reason == pauseReason.Leave)
    {
        patchState(
            party,
            {
                lobby: true,
                text: 'Adversary  gone',
                textSize: 0.5,
                textColor: 0xff0000,
            }
        );
    }
    else if (reason == pauseReason.Regain)
    {
        patchState(
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
        patchState(
            party,
            {
                lobby: false,
                text: 'Party paused',
                textSize: 0.5,
                textColor: 0x00ffff,
            }
        );
    }
    sendState(
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

function getSlotFromSocket (party: party, socket: Socket): -1 | 0 | 1
{
    if (party.playersSocket[0] && party.playersSocket[0].id == socket.id)
        return 0;
    else if (party.playersSocket[1] && party.playersSocket[1].id == socket.id)
        return 1;
    else
        return -1;
}

function move(position: number, socket: Socket)
{
    const party = findPartyFromSocket(socket);

    if (!party || party.status == partyStatus.Paused)
        return ;
    let slot = getSlotFromSocket(party, socket);

    if (slot == -1)
        return ;
    
    let newPlayerPosition = party.state.players.slice() as [number, number];
    newPlayerPosition[slot] = position;
    let newState = { players: newPlayerPosition };
    setState(party, newState);
    sendSocketState(party.playersSocket[slot == 0 ? 1 : 0], newState, undefined);
}

function leaveAll (socket: Socket)
{
    const party = findPartyFromSocket(socket);

    if (party)
    {
        let slot = getSlotFromSocket(party, socket);

        if (slot == -1)
        {
            console.warn("partiesBySocket referenced a party which doesn't contains the socket");
            return ;
        }

        party.playersSocket[slot] = null;
        party.playersReady[slot] = false;
        delete partiesBySocket[socket.id];

        // should make avatar grayscale

        pause(party, pauseReason.Leave);
    }
}

function joinParty (party: party, socket: Socket): party
{
    const userId: string = "userIdB";

    leaveAll(socket);

    let slot;
    if (party.playersId[0] && party.playersId[0] != userId)
    {
        if (party.playersId[1] && party.playersId[1] != userId)
            throw "Party is already full";
        else
            slot = 1;
    }
    else
        slot = 0;

    party.playersId[slot] = userId;
    party.playersSocket[slot] = socket;
    partiesBySocket[socket.id] = party;

    if (party.playersSocket[0] && party.playersSocket[1])
    {
        if (party.status == partyStatus.AwaitingPlayer)
        {
            party.status = partyStatus.Paused;
            patchState(
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
        {
            pause(party, pauseReason.Regain);
        }
    }
    
    return (party);
}

function createParty (room: string, map: map, socket?: Socket): party
{
    let party = findParty(room);

    if (party)
    {
        if (party.map != map)
            throw "Party exists with a different map";
        if (party.playersSocket[0] && party.playersSocket[1] && !party.playersSocket.includes(socket))
            throw "Party exists but is already full";
        return socket ? joinParty(party, socket) : party;
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
            playersSocket: [socket || null, null],
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

        parties.push(party);
        if (socket)
            partiesBySocket[socket.id] = party;

        patchState(
            party,
            {
                lobby: true,
                text: 'Awaiting player...',
                textSize: 0.5,
                textColor: 0xffff00
            },
            true
        );

        return (party);
    }
}

function play (party: party)
{
    party.status = partyStatus.Warmup;
    party.statusData.since = new Date();
    party.statusData.counter = 0;
    patchState(
        party,
        {
            lobby: false,
            text: '3',
            textSize: 1,
            textColor: 0x00ffff,
        }
    );
}

function click (socket: Socket)
{
    const party = findPartyFromSocket(socket);

    if (!party)
        return ;
    let slot = getSlotFromSocket(party, socket);
    
    if (party.status == partyStatus.Paused)
    {
        party.playersReady[slot] = !party.playersReady[slot];
        if (party.playersReady[0] && party.playersReady[1])
        {
            play(party);
        }
        else if (party.playersReady[slot])
        {
            sendSocketState(
                socket,
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
            sendSocketState(
                socket,
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
        pause(party, pauseReason.Explicit);
}

type createGameEventFunction = (room: string, map: map) => void;
type joinGameEventFunction = (room: string) => void;
type leaveAllGameEventFunction = () => void;
type moveEventFunction = (position: number) => void;
type clickEventFunction = () => void;

function sendError(e, socket: Socket)
{
    let message;

    if (e && typeof e === 'object' && 'message' in e)
        message = e.message;
    else
        message = e + '';

    sendSocketState(socket, {
        ballSpeedX: 0,
        ballSpeedY: 0,
        text: message,
        textSize: 0.25,
        textColor: 0xff000
    }, 0);
}

io.on('connection', (socket: Socket) => {

    socket.on('disconnect', () => {
        leaveAll(socket);
    });

    socket.on(
        'game::create',
        (
            (room, map) =>
            {
                try
                {
                    createParty(room, map, socket);
                }
                catch (e: any)
                {
                    sendError(e, socket);
                }
            }
        ) as createGameEventFunction
    );

    socket.on(
        'game::join',
        (
            (room) =>
            {
                const party = findParty(room);

                if (party)
                {
                    try
                    {
                        joinParty(party, socket);
                    }
                    catch (e: any)
                    {
                        sendError(e, socket);
                    }
                }
                else
                {
                    sendError("Party not found", socket);
                }
            }
        ) as joinGameEventFunction
    );

    socket.on(
        'game::leaveAll',
        (
            () =>
            {
                leaveAll(socket);                
            }
        ) as leaveAllGameEventFunction
    );

    socket.on(
        'game::move',
        (
            (position: number) =>
            {
                move(position / 1000, socket);
            }
        ) as moveEventFunction
    );

    socket.on(
        'game::click',
        (
            () =>
            {
                click(socket);
            }
        ) as clickEventFunction
    );
});