import type { Clock } from 'three';
import type { Socket } from 'socket.io';
import type { serverState, userId, team, teamNone, partyQuery } from 'src/common/game/logic/common';

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
    room: string,
    map: string,
    clock: Clock,
    status: partyStatus,
    statusData: {
        since: Date,
        counter: number,
        previousStatus: partyStatus
    },
    wonSleeve: team | teamNone,
    playersSocket: [Socket | null, Socket | null],
    playersId: [userId | null, userId | null],  // Also used to reserve the place
    playersReady: [boolean, boolean],
    state: serverState
};

export interface Query
{
    client: Socket,
    query: partyQuery
}