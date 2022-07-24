import { User } from './user.entity';

export interface invitationDTO {
  id: number;
  userSending: User;
  userReceiving: User;
}
