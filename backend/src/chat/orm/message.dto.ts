import { User } from 'src/users/orm/user.entity';
import { Channel } from './channel.entity';
import { IsDate, IsInt, IsPositive, IsOptional, IsString, ValidateNested } from 'class-validator';

export class MessageDTO {
  @IsInt()
  @IsPositive()
  @IsOptional()
    id: number;

  @ValidateNested()
    create: User;
  
  @ValidateNested()
    channel: Channel;
  
  @IsString()
    content: string;
  
  @IsDate()
  @IsOptional()
    timestamp: Date;
  
  @IsDate()
  @IsOptional()
    modified: Date;
}
