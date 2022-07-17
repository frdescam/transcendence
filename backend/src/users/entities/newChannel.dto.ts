import { User } from "./user.entity";
import { IsEnum, IsOptional } from 'class-validator';
import { channelTypes } from "./channel.entity";

export class newChannelDto {
    owner: User;
    name: string;
    @IsEnum(channelTypes)
    type: string;
    @IsOptional()
    password: string;
}