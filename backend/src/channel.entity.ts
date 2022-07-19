import { BaseEntity } from "typeorm";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BannedUser } from "./bannedUser.entity";
import { Message } from "./message.entity";
import { MutedUser } from "./mutedUser.entity";
import { User } from "./users/entities/user.entity";

export enum channelTypes {
    PUBLIC = "public",
    PRIVATE = "private",
    PASSWD = "passwd",
    DIRECT = "direct"
}

@Entity()
export class Channel extends BaseEntity {
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

    @OneToMany(() => BannedUser, (bannedUser) => bannedUser.channel)
    bannedUsers: BannedUser[];

    @OneToMany(() => MutedUser, (mutedUser) => mutedUser.channel)
    mutedUsers: MutedUser[];

    @ManyToMany(() => User)
    @JoinTable()
    admins: User[];

    @ManyToMany(() => User)
    @JoinTable()
    users: User[];
}