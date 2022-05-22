import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Message } from "./message.entity";
import { User } from "./user.entity";

export enum channelTypes {
    PUBLIC = "public",
    PRIVATE = "private",
    PASSWD = "passwd",
    DIRECT = "direct"
}

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.ownedChannels)
    owner: User;

    @Column()
    name: string;

    @Column({type: "enum", enum: channelTypes})
    type: channelTypes;

    @Column()
    password: string;

    @CreateDateColumn()
    creationDate: Date;

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];

    @ManyToMany(() => User)
    @JoinTable()
    admins: User[];

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];
}