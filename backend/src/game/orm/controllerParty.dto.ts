import { IsOptional, IsAlphanumeric, IsInt, Length, Min } from 'class-validator';
import type { userId } from 'src/common/game/types';

export class createPartyDto
{
	@Length(1, 256)
	@IsAlphanumeric()
	@IsOptional()
		room?: string;

	@Length(1, 256)
	@IsAlphanumeric()
	@IsOptional()
		map?: string = 'classic';

	@Min(0)
	@IsInt()
	@IsOptional()
		adversary?: userId;
}

export class partyGiveupDto
{
	@Length(1, 256)
	@IsOptional()
		room?: string;
}
	

export class partyGetDto
{
	@Length(1, 256)
		room: string;
}
	