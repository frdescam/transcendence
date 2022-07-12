import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/user/orm/user.entity';

@Entity()
export class Match extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @ManyToOne(() => User, (user) => user.matchesHome)
      userHome: User;

    @ManyToOne(() => User, (user) => user.matchesForeign)
      userForeign: User;

    @Column()
      userHomeScore: number;

    @Column()
      userForeignScore: number;

    @CreateDateColumn()
      timestamp: Date;
}