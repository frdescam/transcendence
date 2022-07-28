import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Friend extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.friends)
    user: User;

    @ManyToOne(() => User, (user) => user.followedBy, {
        eager: true
    })
    followedUser: User;

    @Column()
    isPending: boolean;
}