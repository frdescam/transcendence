import { User } from 'src/users/orm/user.entity';
import { Channel } from './channel.entity';

export interface MessageDTO {
	id: number;
	create: User;
	channel: Channel;
	content: string;
	timestamp: Date;
	modified: Date;
}
