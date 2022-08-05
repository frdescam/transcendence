import type { userId } from '../types';
import type { getPartyDto } from './getParty.dto';

export class getUserPartyDto
{
  userId: userId;
  party: getPartyDto | null;
};
  