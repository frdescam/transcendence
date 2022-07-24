import { Banned } from 'src/chat/orm/banned.entity';
import { Muted } from 'src/chat/orm/muted.entity';
import { Channel } from 'src/chat/orm/channel.entity';
import { Message } from 'src/chat/orm/message.entity';

import { Match } from 'src/match/orm/match.entity';

import { twoFaDTO } from './twoFaDTO';
import { Invitation } from './invitation.entity';
import { User } from './user.entity';

export interface UserDTO {
  id: number;
  pseudo: string;
  password: string;
  avatar: string;
  typeOf2FA: twoFaDTO;
  valueOf2FA: string;
  xp: number;
  connected: boolean;
  friends: UserDTO[];
  receivedInvitations: Invitation[];
  sentInvitations: Invitation[];
  matchesHome: Match[];
  matchesForeign: Match[];
  ownedChannels: Channel[];
  messages: Message[];
  bannedFrom: Banned[];
  mutedFrom: Muted[];
  blockedUsers: User[];
}
