import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Channel } from './channel.entity';

@Entity()
export class Message extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => User, (user) => user.messages)
      creator: User;

    @ManyToOne(() => Channel, (channel) => channel.messages)
      channel: Channel;

    @Column({type: 'text'})
      content: string;

    @CreateDateColumn()
      timestamp: Date;
    
    @UpdateDateColumn()
      modified: Date;
}