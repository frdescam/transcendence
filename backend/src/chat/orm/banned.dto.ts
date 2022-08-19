import { Channel } from './channel.entity';
import { User } from 'src/users/orm/user.entity';

export interface BannedDTO {
  id: number;
  channel: Channel;
  user: User;
  until: Date;
}
