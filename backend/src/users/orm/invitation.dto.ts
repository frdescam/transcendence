import { User } from './user.entity';

export interface InvitationDTO {
  id: number;
  userSending: User;
  userReceiving: User;
}
