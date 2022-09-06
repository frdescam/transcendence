import { User } from 'src/users/orm/user.entity';
import { channelTypesDTO } from './channelTypes.dto';
import { Message } from './message.entity';
import { Banned } from './banned.entity';
import { Muted } from './muted.entity';
import { IsArray, IsDate, IsInt, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class ChannelDTO {
  @IsInt()
  @IsPositive()
  @IsOptional()
    id: number;

  @ValidateNested()
  @IsOptional()
    owner: User;
  
  @IsString()
  @IsOptional()
    name: string;

  @IsOptional()
    type: channelTypesDTO;

  @IsString()
  @IsOptional()
    password: string;
  
  @IsDate()
  @IsOptional()
    creationDate: Date;
  
  @IsArray()
  @IsOptional()
    messages: Message[];

  @IsArray()
  @IsOptional()
    bannedUsers: Banned[];

  @IsArray()
  @IsOptional()
    mutedUsers: Muted[];

  @IsArray()
  @IsOptional()
    admins: User[];

  @IsArray()
  @IsOptional()
    users: User[];
}
