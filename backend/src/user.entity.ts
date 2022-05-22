import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Match } from "./match.entity";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";

export enum TypesOf2FA {
    NONE = "none",
    SMS = "sms",
    MAIL = "mail",
    AUTH_APP = "auth_app" // TODO: check what 2FA types we implement
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", length: 50})
    pseudo: string;

    @Column({type: "varchar", length: 60})
    password: string;

    @Column({type: "varchar", length: 50})
    avatar: string;

    @Column({type: "enum", enum: TypesOf2FA})
    typeOf2FA: TypesOf2FA;

    @Column({type: "varchar", length: 60})
    valueOf2FA: string; // TODO: check what we need to store here

    @Column({type: "float4"})
    xp: number;

    @OneToMany(() => Match, (match) => match.user1)
    matches: Match[];

    @OneToMany(() => Channel, (channel) => channel.owner)
    ownedChannels: Channel[];

    @OneToMany(() => Message, (message) => message.creator)
    messages: Message[];

    @ManyToMany(() => User)
    blockedUsers: User[];
}