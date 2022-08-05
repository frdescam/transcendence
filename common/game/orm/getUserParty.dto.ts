import type { userId } from '../types';
import type { getPartyDto } from './getParty.dto';

export interface getUserPartyDto
{
  userId: userId;
  party: getPartyDto | null;
};
  