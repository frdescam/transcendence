import { Channel } from "./channel.entity";
import { User } from "./users/entities/user.entity";

export class newMessageDto {
    creator: User;
    channel: Channel;
    content: string;
}