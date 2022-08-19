import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Channel } from 'src/chat/orm/channel.entity';
import { Message } from 'src/chat/orm/message.entity';
import { Banned } from 'src/chat/orm/banned.entity';
import { Muted } from 'src/chat/orm/muted.entity';
import { Match } from 'src/match/orm/match.entity';

import { Invitation } from './invitation.entity';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({type: 'int4', nullable: true, unique: true}) // if we dont do passwords then this shouldnt be null!
      fortytwo_id: number; // marvin id to look for ppl;

    @Column({type: 'varchar', length: 50, unique: true}) // change to unique cos must be unique!
      pseudo: string;

    @Column({type: 'varchar', nullable: true}) // nullable
      refresh_token: string;

    @Column({type: 'varchar', length: 50, nullable: true}) // is email even useful here? could erase mosty likely
      email: string;

    @Column({type: 'varchar', length: 60, nullable: true}) // nullable, optional?
      password: string;

    @Column({type: 'varchar', length: 50, nullable: true})
      avatar: string;

    @Column({type: 'boolean', default: false})
      is2FActive: boolean;

    @Column({type: 'varchar', length: 60, nullable: true})
      secretOf2FA: string; // TODO: check what we need to store here

    @Column({type: 'float4', default: 0.0})
      xp: number;

    @Column({type: 'int4', default: 0})
      ratio: number;

    @Column({ type: 'boolean', default: () => 'false'})
      connected: boolean;

    @ManyToMany(() => User, (user) => user.friends)
      friends: User[];

    @OneToMany(() => Invitation, (pendingInvitation) => pendingInvitation.userSending)
      receivedInvitations: Invitation[];

    @OneToMany(() => Invitation, (pendingInvitation) => pendingInvitation.userReceiving)
      sentInvitations: Invitation[];

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

    @OneToMany(() => Banned, (bannedUser) => bannedUser.user)
      bannedFrom: Banned[];

    @OneToMany(() => Muted, (mutedUser) => mutedUser.user)
      mutedFrom: Muted[];

    @ManyToMany(() => User)
      blockedUsers: User[];
}