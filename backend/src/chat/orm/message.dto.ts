import { User } from 'src/user/orm/user.entity';
import { Channel } from './channel.entity';

export interface MessageDTO {
  id: number;
  create: User;
  channel: Channel;
  content: string;
  timestamp: Date;
  modified: Date;
}
