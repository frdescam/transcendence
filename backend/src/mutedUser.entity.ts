import { BaseEntity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm";
import { User } from "./users/entities/user.entity";
import { Channel } from "./channel.entity";

@Entity()
export class MutedUser extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Channel, (channel) => channel.bannedUsers)
    channel: Channel;

    @ManyToOne(() => User, (user) => user.bannedFrom)
    user: User;

    @Column({type: "date"})
    until: Date;
}