import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Channel } from 'src/chat/orm/channel.entity';
import { Message } from 'src/chat/orm/message.entity';
import { Banned } from 'src/chat/orm/banned.entity';
import { Muted } from 'src/chat/orm/muted.entity';

import { Match } from 'src/match/orm/match.entity';

import { twoFaDTO } from './twoFaDTO';
import { Invitation } from './invitation.entity';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({type: 'varchar', length: 50, default: 'John Doe'})
      pseudo: string;

    @Column({type: 'varchar', length: 60, nullable: true})
      password: string;

    @Column({type: 'varchar', length: 50, nullable: true})
      avatar: string;

    @Column({type: 'enum', enum: twoFaDTO, default: twoFaDTO.NONE})
      typeOf2FA: twoFaDTO;

    @Column({type: 'varchar', length: 60, nullable: true})
      valueOf2FA: string; // TODO: check what we need to store here

    @Column({type: 'float4', default: 0.0})
      xp: number;

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