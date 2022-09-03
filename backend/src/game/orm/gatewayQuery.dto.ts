import { IsAlphanumeric, IsInt, IsOptional, Length, Min } from 'class-validator';
import type { userId } from 'src/common/game/types';

export class queryFindDto
{
	@Length(1, 256)
	@IsAlphanumeric()
	@IsOptional()
		map?: string = 'classic';

	@Min(0)
	@IsInt()
	@IsOptional()
		adversary?: userId;
}