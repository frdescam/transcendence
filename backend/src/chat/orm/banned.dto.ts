import { Channel } from './channel.entity';
import { User } from 'src/user/orm/user.entity';

export interface BannedDTO {
  id: number;
  channel: Channel;
  user: User;
  until: Date;
}
