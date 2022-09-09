import { Channel } from './channel.entity';
import { User } from 'src/users/orm/user.entity';
import { IsDate, IsInt, IsOptional, ValidateNested } from 'class-validator';

export class BannedDTO {
  @IsInt()
  @IsOptional()
    id: number;
  
  @ValidateNested()
    channel: Channel;
  
  @ValidateNested()
    user: User;
  
  @IsDate()
  @IsOptional()
    until: Date;
}
