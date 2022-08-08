import type { Clock } from 'three';
import type { Socket } from 'socket.io';
import type { userId, inclusiveTeam } from 'src/common/game/types';
import type { serverState, partyQuery } from 'src/common/game/interfaces';

export type map = string;

export enum partyStatus
{
    AwaitingPlayer,
    Warmup,
    Paused,
    IntroducingSleeve,  // when we will intruduce the ball
    Running,
    Finish
}

export enum pauseReason
{
    Explicit,
    Leave,
    Regain,
};

export interface Party
{
    createdAt: Date,
    room: string,
    map: string,
    clock: Clock,
    status: partyStatus,
    statusData: {
        since: Date,
        counter: number,
        previousStatus: partyStatus
    },
    wonSleeve: inclusiveTeam,
    spectators: Socket[],
    playersSocket: [Socket | null, Socket | null],
    playersId: [userId | null, userId | null],  // Also used to reserve the place
    state: serverState
};

export interface Query
{
    client: Socket,
    query: partyQuery
}