import type { userId, avatar } from 'src/common/game/logic/common';

export class getPartyDto
{
    room: string;
    map: string;
    status: string;
    players: [userId, userId | null];
    avatars: [avatar, avatar];
    scores: [number, number];
};
  