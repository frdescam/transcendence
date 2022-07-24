import { User } from 'src/user/orm/user.entity';

export interface MatchDTO {
  id: number;
  userHome: User;
  userForeign: User;
  userHomeScore: number;
  userForeignScore: number;
  timestamp: Date;
}
