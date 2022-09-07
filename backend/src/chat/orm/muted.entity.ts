import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/orm/user.entity';
import { Channel } from './channel.entity';

@Entity()
export class Muted extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => Channel, (channel) => channel.mutedUsers)
      channel: Channel;

    @ManyToOne(() => User, (user) => user.mutedFrom)
      user: User;

    @Column({type: 'timestamp', default: () => 'now()'})
      until: Date;
}