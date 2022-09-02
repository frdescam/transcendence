import type { userId } from 'src/common/game/types';

export interface CreatePartyDto
{
	room?: string;
	map?: string;
	adversary?: userId
}
	