import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Channel } from "./channel.entity";
import { BaseEntity } from "typeorm";

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.messages)
    creator: User;

    @ManyToOne(() => Channel, (channel) => channel.messages)
    channel: Channel;

    @Column({type: "text"})
    content: string;

    @CreateDateColumn()
    timestamp: Date;
}