import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => User, (user) => user.friends, {
      eager: true
    })
      user: User;

    @ManyToOne(() => User, (user) => user.followedBy, {
      eager: true
    })
      followedUser: User;

    @Column({
      type: 'boolean',
      default: true,
    })
      isPending: boolean;
}