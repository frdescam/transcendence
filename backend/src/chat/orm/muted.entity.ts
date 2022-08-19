import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/orm/user.entity';
import { Channel } from './channel.entity';

@Entity()
export class Muted extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => Channel, (channel) => channel.bannedUsers)
      channel: Channel;

    @ManyToOne(() => User, (user) => user.bannedFrom)
      user: User;

    @Column({type: 'timestamp', default: () => 'now()'})
      until: Date;
}