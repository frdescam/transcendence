import { User } from './user.entity';

export class MatchRegistrationDto {
    map: string;
    userHome: User;
    userForeign: User;
    winner: User;
    userHomeScore: number;
    userForeignScore: number;
}