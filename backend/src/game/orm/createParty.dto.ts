import { Transform } from 'class-transformer';
import { IsOptional, IsAlphanumeric, IsInt, Length, Min } from 'class-validator';
import type { userId } from 'src/common/game/types';

export class CreatePartyDto
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
	@Transform(({value}) => Number(value))
	@IsOptional()
		adversary?: userId;
}
	