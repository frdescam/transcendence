import { Channel } from './channel.entity';
import { User } from 'src/users/orm/user.entity';
import { IsDate, IsInt, IsOptional, IsPositive, ValidateNested } from 'class-validator';

export class BannedDTO {
  @IsInt()
  @IsPositive()
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
