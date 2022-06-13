import { User } from 'src/user/orm/user.entity';
import { Channel } from './channel.entity';

export interface messageDTO {
  id: number;
  create: User;
  channel: Channel;
  content: string;
  timestamp: Date;
}
