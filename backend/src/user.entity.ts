import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Match } from "./match.entity";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";
import { BannedUser } from "./bannedUser.entity";
import { MutedUser } from "./mutedUser.entity";
import { PendingInvitation } from "./pendingInvitation.entity";

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

    @ManyToMany(() => User, (user) => user.friends)
    friends: User[];

    @OneToMany(() => PendingInvitation, (pendingInvitation) => pendingInvitation.userSending)
    receivedInvitations: PendingInvitation[];

    @OneToMany(() => PendingInvitation, (pendingInvitation) => pendingInvitation.userReceiving)
    sentInvitations: PendingInvitation[];

    @OneToMany(() => Match, (match) => match.userAtHome)
    matchesAtHome: Match[];

    @OneToMany(() => Match, (match) => match.userAsForeigner)
    matchesAsForeigner: Match[];

    @OneToMany(() => Channel, (channel) => channel.owner)
    ownedChannels: Channel[];

    @OneToMany(() => Message, (message) => message.creator)
    messages: Message[];

    @OneToMany(() => BannedUser, (bannedUser) => bannedUser.user)
    bannedFrom: BannedUser[];

    @OneToMany(() => MutedUser, (mutedUser) => mutedUser.user)
    mutedFrom: MutedUser[];

    @ManyToMany(() => User)
    blockedUsers: User[];
}