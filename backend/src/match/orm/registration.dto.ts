import { User } from 'src/user/orm/user.entity';

export class MatchRegistrationDto {
  map: string;
  userHome: User;
  userForeign: User;
  winner: User;
  userHomeScore: number;
  userForeignScore: number;
}