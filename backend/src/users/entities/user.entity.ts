import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Match } from "./match.entity";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";
import { BannedUser } from "./bannedUser.entity";
import { MutedUser } from "./mutedUser.entity";
import { PendingInvitation } from "./pendingInvitation.entity";

// Add status : online | offline? (use refresh token)

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int4", nullable: true, unique: true}) // if we dont do passwords then this shouldnt be null!
    fortytwo_id: number; // marvin id to look for ppl;

    @Column({type: "varchar", length: 50, unique: true}) // change to unique cos must be unique!
    pseudo: string;

    @Column({type: "varchar", nullable: true}) // nullable
    refresh_token: string;

    @Column({type: "varchar", length: 50}) // is email even useful here? could erase mosty likely
    email: string;

    @Column({type: "varchar", length: 60, nullable: true}) // nullable, optional?
    password: string;

    @Column({type: "varchar", length: 50, nullable: true})
    avatar: string;

    @Column({type: "boolean", default: false})
    is2FActive: boolean;

    @Column({type: "varchar", length: 60, nullable: true})
    secretOf2FA: string; // TODO: check what we need to store here

    @Column({type: "float4", default: 0.0})
    xp: number;

    @Column({type: "int4", default: 0})
    ratio: number;

    @ManyToMany(() => User, (user) => user.friends)
    friends: User[];

    @OneToMany(() => PendingInvitation, (pendingInvitation) => pendingInvitation.userSending)
    receivedInvitations: PendingInvitation[];

    @OneToMany(() => PendingInvitation, (pendingInvitation) => pendingInvitation.userReceiving)
    sentInvitations: PendingInvitation[];

    @OneToMany(() => Match, (match) => match.userHome)
    matchesHome: Match[];

    @OneToMany(() => Match, (match) => match.userForeign)
    matchesForeign: Match[];

    @OneToMany(() => Match, (match) => match.winner)
    matchesWon: Match[];

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