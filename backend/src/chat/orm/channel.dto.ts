import { User } from 'src/users/orm/user.entity';
import { channelTypesDTO } from './channelTypes.dto';
import { Message } from './message.entity';
import { Banned } from './banned.entity';
import { Muted } from './muted.entity';

export interface ChannelDTO {
  id: number;
  owner: User;
  name: string;
  type: channelTypesDTO;
  password: string;
  creationDate: Date;
  messages: Message[];
  bannedUsers: Banned[];
  mutedUsers: Muted[];
  admins: User[];
  users: User[];
}
