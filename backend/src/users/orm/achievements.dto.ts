export enum AchievementsEnumName {
    ZAPATERO = '11 - 0 zapatero',
    TEN_WINS = 'Win 10 games',
    TEN_GAMES = 'Play 10 games',
    CLOSE_CALL = 'Close call!',
    LEVEL_ONE = 'Level 1',
    HUNDRED_GAMES = 'Play 100 games',
    COMPLETE = 'Completionist',
}

export interface AchievementsDto {
  name : AchievementsEnumName,
  key : string
}

export const Achievements : AchievementsDto[] = [
  {
    name: AchievementsEnumName.ZAPATERO,
    key: 'zapatero',
  },
  {
    name: AchievementsEnumName.TEN_WINS,
    key: 'tenWins',
  },
  {
    name: AchievementsEnumName.TEN_GAMES,
    key: 'tenGames',
  },
  {
    name: AchievementsEnumName.CLOSE_CALL,
    key: 'closeCall',
  },
  {
    name: AchievementsEnumName.LEVEL_ONE,
    key: 'levelOne',
  },
  {
    name: AchievementsEnumName.HUNDRED_GAMES,
    key: 'hundredGames',
  },
  {
    name: AchievementsEnumName.COMPLETE,
    key: 'complete'
  },
];