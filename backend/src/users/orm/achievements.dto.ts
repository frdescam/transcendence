export enum AchievementsEnumName {
    ZAPATERO = '7 - 0 zapatero',
    TEN_WINS = 'Win 10 games',
    TEN_GAMES = 'Play 10 games',
    CLOSE = 'Close call!',
    LEVEL_ONE = 'Level 1',
    HUNDRED_GAMES = 'Play 100 games',
    COMPLETE = 'Completionist',
  };

export const Achievements = [
	{
		name: AchievementsEnumName.ZAPATERO,
		description: 'You won without taking a goal',
		// image: AchievementsImage.DEFENSE_MASTER,
	},
	{
		name: AchievementsEnumName.TEN_WINS,
		description: 'You won 10 games',
		// image: AchievementsImage.TEN_WINS,
	},
	{
		name: AchievementsEnumName.TEN_GAMES,
		description: 'Play 10 games',
		// image: AchievementsImage.THIRTY_WINS,
	},
	{
		name: AchievementsEnumName.CLOSE,
		description: 'Win a match with a score of 11 - 10',
		// image: AchievementsImage.SEVENTY_WINS,
	},
	{
		name: AchievementsEnumName.LEVEL_ONE,
		description: 'Reach level one',
		// image: AchievementsImage.HUNDRED_WINS,
	},
	{
		name: AchievementsEnumName.HUNDRED_GAMES,
		description: 'Play 100 games',
		// image: AchievementsImage.TWO_HUNDRED_WINS,
	},
	{
		name: AchievementsEnumName.COMPLETE,
		description: 'Finish every game achievement',
		// image: AchievementsImage.ALL_TERRAIN,
	},
];