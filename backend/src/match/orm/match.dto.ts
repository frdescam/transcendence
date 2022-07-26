import { User } from 'src/user/orm/user.entity';

export interface MatchDTO {
  id: number;
  map: string;
  userHome: User;
  userForeign: User;
  winner: User;
  userHomeScore: number;
  userForeignScore: number;
  timestamp: Date;
}
