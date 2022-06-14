import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Banned } from './banned.entity';
import { Message } from './message.entity';
import { Muted } from './muted.entity';
import { User } from 'src/user/orm/user.entity';

import { channelTypesDTO } from './channelTypes.dto';

@Entity()
export class Channel extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @ManyToOne(() => User, (user) => user.ownedChannels)
    owner: User;

  @Column()
    name: string;

  @Column({type: 'enum', enum: channelTypesDTO})
    type: channelTypesDTO;

  @Column()
    password: string;

  @CreateDateColumn()
    creationDate: Date;

  @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];

  @OneToMany(() => Banned, (bannedUser) => bannedUser.channel)
    bannedUsers: Banned[];

  @OneToMany(() => Muted, (mutedUser) => mutedUser.channel)
    mutedUsers: Muted[];

  @ManyToMany(() => User)
  @JoinTable()
    admins: User[];

  @ManyToMany(() => User)
  @JoinTable()
    users: User[];
}
