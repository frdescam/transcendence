import { IsInt, Length, Max, Min } from 'class-validator';

export class partyPingDto
{
	@Length(1, 64)
		cdate: string;
}

export class partyJoinDto
{
	@Length(1, 256)
		room: string;
}

export class partySpecateDto
{
	@Length(1, 256)
		room: string;
}

export class partyMoveDto
{
	@Min(0)
	@Max(1000)
	@IsInt()
		position: number;
}