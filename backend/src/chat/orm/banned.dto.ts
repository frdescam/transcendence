import { Channel } from './channel.entity';
import { User } from 'src/user/orm/user.entity';

export interface bannedDTO {
  id: number;
  channel: Channel;
  user: User;
  until: Date;
}