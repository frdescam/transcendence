import { IsNumber } from 'class-validator';
import type { userId } from 'src/common/game/logic/common';

export class CreatePartyDto
{
    room?: string;
    map?: string;
    adversary?: userId
};
  