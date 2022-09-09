import type { userId, avatar } from '../types';

export interface getPartyDto
{
    room: string;
    createdAt: string;
    map: string;
    status: string;
    players: [userId, userId | null];
    avatars: [avatar, avatar];
    scores: [number, number];
    finish: boolean;
}
