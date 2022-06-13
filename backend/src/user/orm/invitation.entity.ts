import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Invitation extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => User, (user) => user.sentInvitations)
      userSending: User;

    @ManyToOne(() => User, (user) => user.receivedInvitations)
      userReceiving: User;
}