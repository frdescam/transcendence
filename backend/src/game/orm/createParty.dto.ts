import type { userId } from 'src/common/game/types';

export class CreatePartyDto
{
    room?: string;
    map?: string;
    adversary?: userId
};
  