import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';

export class admBanMut {
  @IsInt()
  @IsOptional()
    id: number;
  
  @IsInt()
  @IsPositive()
    userId: number;
  
  @IsInt()
  @IsPositive()
    channelId: number;
  
  @IsDate()
  @IsOptional()
    until: Date;
}

export class blockedUser {
  @IsInt()
  @IsPositive()
    id: number;

  @IsInt()
  @IsPositive()
    blockedId: number;
}

export class receiveChannel {
  @IsInt()
  @IsOptional()
    id: number;

  @IsInt()
  @IsPositive()
    creator: number;
  
  @IsString()
  @IsOptional()
    name: string;

  @IsString()
  @IsOptional()
    type: string;

  @IsString()
  @IsOptional()
    password: string;
  
  @IsArray()
  @IsInt({
    each: true
  })
  @IsOptional()
    users?: Array<number>;
}

export class passwordCompare {
  @IsInt()
  @IsPositive()
    channelId: number;
  
  @IsString()
  @IsNotEmpty()
    password: string;
}

export class receiveInvitation {
  @IsInt()
    creatorId: number;
  
  @IsString()
    creatorName: string;
  
  @IsInt()
    invitationId: number;
  
  @IsString()
    invitationName: string;
  
  @IsString()
    gameLink: string;
  
  @IsBoolean()
  @IsOptional()
    approvalFromInvitedUser?: boolean;
}

export class receiveMessage {
  @IsInt()
  @IsPositive()
    id: number;

  @IsInt()
  @IsPositive()
    channel: number;
  
  @IsString()
  @IsOptional()
    message: string;
  
  @IsInt()
  @IsOptional()
    length: number;
  
  @IsDate()
  @IsOptional()
    timestamp: Date;
  
  @IsString()
  @IsOptional()
    hash: string;
}

export class updateMessage {
  @IsInt()
  @IsPositive()
    id: number;

  @IsInt()
  @IsPositive()
    channel: number;

  @IsInt()
  @IsPositive()
    messageId: number;

  @IsString()
  @IsOptional()
    message: string;

  @IsInt()
  @IsOptional()
    length: number;

  @IsDate()
  @IsOptional()
    timestamp: Date;

  @IsString()
  @IsOptional()
    hash: string;
}

export class channelUser {
  @IsInt()
  @IsPositive()
    userId: number;

  @IsInt()
  @IsPositive()
    channelId: number;
}

export interface timestamp {
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number
}
