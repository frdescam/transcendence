import { User } from "./users/entities/user.entity";
import { IsEnum, IsOptional } from 'class-validator';
import { channelTypes } from "./users/entities/channel.entity";

export class newChannelDto {
    owner: User;
    name: string;
    @IsEnum(channelTypes)
    type: string;
    @IsOptional()
    password: string;
}