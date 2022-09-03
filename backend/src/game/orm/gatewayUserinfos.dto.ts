import { IsInt, Min } from 'class-validator';

export class userinfosDto
{
	@Min(0)
	@IsInt()
		id: number;
}
