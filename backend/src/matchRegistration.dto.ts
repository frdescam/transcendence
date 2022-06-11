import { User } from 'src/user.entity';

export class MatchRegistrationDto {
    userHome: User;
    userForeign: User;
    userHomeScore: number;
    userForeignScore: number;
}