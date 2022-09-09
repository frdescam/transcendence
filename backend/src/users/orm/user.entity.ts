import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from 'src/chat/orm/channel.entity';
import { Message } from 'src/chat/orm/message.entity';
import { Banned } from 'src/chat/orm/banned.entity';
import { Muted } from 'src/chat/orm/muted.entity';
import { Match } from 'src/match/orm/match.entity';
import { Friend } from './friend.entity';
import { Ignore } from './ignored.entity';
import { AchievementsEnumName } from './achievements.dto';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column({type: 'int4', nullable: true, unique: true})
      fortytwo_id: number;

    @Column({type: 'varchar', length: 50})
      pseudo: string;

    @Column({type: 'varchar', nullable: true})
      refresh_token: string;

    @Column({type: 'varchar', length: 50, nullable: true})
      email: string;

    @Column({type: 'varchar', length: 70, nullable: true})
      avatar: string;

    @Column({type: 'boolean', default: false})
      is2FActive: boolean;

    @Column({type: 'varchar', length: 60, nullable: true})
      secretOf2FA: string;

    @Column({type: 'float4', default: 0.0})
      xp: number;

    @Column({type: 'int4', default: 0})
      ratio: number;

    @Column({type: 'int4'})
      rank: number;

    @Column({type : 'enum', array: true, default: [], nullable: true, enum: AchievementsEnumName})
      achievements: AchievementsEnumName[];

    @Column({ type: 'boolean', default: () => 'false'})
      connected: boolean;

    @Column({ type: 'boolean', default: () => 'true'})
      new_user: boolean;

    @OneToMany(() => Friend, (friend) => friend.user)
      friends: Friend[];

    @OneToMany(() => Friend, (friend) => friend.followedUser)
      followedBy: Friend[];

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

    @OneToMany(() => Ignore, (ignore) => ignore.user)
      blockedUsers: Ignore[];

    @OneToMany(() => Ignore, (ignore) => ignore.target)
      blockedUsersBy: Ignore[];
}