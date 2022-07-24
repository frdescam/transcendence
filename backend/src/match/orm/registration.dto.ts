import { User } from 'src/user/orm/user.entity';

export class MatchRegistrationDto {
  userHome: User;
  userForeign: User;
  userHomeScore: number;
  userForeignScore: number;
}