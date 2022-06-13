import { User } from 'src/user/orm/user.entity';

export interface matchDTO {
  id: number;
  userHome: User;
  userForeign: User;
  userHomeScore: number;
  userForeignScore: number;
  timestamp: Date;
}
