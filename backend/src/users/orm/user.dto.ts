import { Banned } from 'src/chat/orm/banned.entity';
import { Muted } from 'src/chat/orm/muted.entity';
import { Channel } from 'src/chat/orm/channel.entity';
import { Message } from 'src/chat/orm/message.entity';

import { Match } from 'src/match/orm/match.entity';

// import { Invitation } from './invitation.entity';
import { Friend } from './friend.entity';
import { User } from './user.entity';
import { Ignore } from './ignored.entity';

export interface UserDTO {
  id: number;
  fortytwo_id: number;
  pseudo: string;
  refresh_token: string;
  email: string;
  // password: string;
  avatar: string;
  is2FActive: boolean;
  secretOf2FA: string;
  xp: number;
  ratio: number;
  rank: number;
  connected: boolean;
  friends: Friend[];
  followedBy: Friend[];
  // receivedInvitations: Invitation[];
  // sentInvitations: Invitation[];
  matchesHome: Match[];
  matchesForeign: Match[];
  matchesWon: Match[];
  ownedChannels: Channel[];
  messages: Message[];
  bannedFrom: Banned[];
  mutedFrom: Muted[];
  // blockedUsers: User[];
  blockedUsers: Ignore[];
  blockedUsersBy: Ignore[];
}
