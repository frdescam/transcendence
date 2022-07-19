import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users/entities/user.entity";

@Entity()
export class PendingInvitation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.sentInvitations)
    userSending: User;

    @ManyToOne(() => User, (user) => user.receivedInvitations)
    userReceiving: User;
}