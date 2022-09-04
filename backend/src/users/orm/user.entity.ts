import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

    @Column({type: 'int4', nullable: true, unique: true}) // if we dont do passwords then this shouldnt be null!
      fortytwo_id: number; // marvin id to look for ppl;

    // unique commented by badam. Reason: Fail to initialize on a fresh database
    @Column({type: 'varchar', length: 50/*, unique: true*/}) // change to unique cos must be unique!
      pseudo: string;

    @Column({type: 'varchar', nullable: true}) // nullable
      refresh_token: string;

    @Column({type: 'varchar', length: 50, nullable: true}) // is email even useful here? could erase mosty likely
      email: string; // erase email

    // @Column({type: 'varchar', length: 60, nullable: true}) // nullable, optional?
      // password: string; // erase password

    @Column({type: 'varchar', length: 70, nullable: true})
      avatar: string;

    @Column({type: 'boolean', default: false})
      is2FActive: boolean;

    @Column({type: 'varchar', length: 60, nullable: true})
      secretOf2FA: string; // TODO: check what we need to store here

    @Column({type: 'float4', default: 0.0})
      xp: number;

    @Column({type: 'int4', default: 0})
      ratio: number;

    @Column({type: 'int4'})
      rank: number;

    @Column({type : 'enum', array: true, default: [], nullable: true, enum: AchievementsEnumName}) // erase nullable?
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