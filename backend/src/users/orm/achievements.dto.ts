export enum AchievementsEnumName {
    ZAPATERO = '7 - 0 zapatero',
    TEN_WINS = 'Win 10 games',
    TEN_GAMES = 'Play 10 games',
    CLOSE = 'Close call!',
    LEVEL_ONE = 'Level 1',
    HUNDRED_GAMES = 'Play 100 games',
    COMPLETE = 'Completionist',
};

export interface AchievementsDto {
	name : AchievementsEnumName,
	description : string,
	image : string
}

export const Achievements : AchievementsDto[] = [
	{
		name: AchievementsEnumName.ZAPATERO,
		description: 'You won without taking a goal',
		image: 'http://127.0.0.1:3000/achievements/zapatero.png',
	},
	{
		name: AchievementsEnumName.TEN_WINS,
		description: 'You won 10 games',
		image: 'http://127.0.0.1:3000/achievements/wins_ten.png',
	},
	{
		name: AchievementsEnumName.TEN_GAMES,
		description: 'Play 10 games',
		image: 'http://127.0.0.1:3000/achievements/play_ten.png',
	},
	{
		name: AchievementsEnumName.CLOSE,
		description: 'Win a match with a score of 11 - 10',
		image: 'http://127.0.0.1:3000/achievements/close.png',
	},
	{
		name: AchievementsEnumName.LEVEL_ONE,
		description: 'Reach level one',
		image: 'http://127.0.0.1:3000/achievements/level_one.png',
	},
	{
		name: AchievementsEnumName.HUNDRED_GAMES,
		description: 'Play 100 games',
		image: 'http://127.0.0.1:3000/achievements/play_hundred.png',
	},
	{
		name: AchievementsEnumName.COMPLETE,
		description: 'Finish every game achievement',
		image: 'http://127.0.0.1:3000/achievements/completionist.png',
	},
];