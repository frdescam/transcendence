import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/users/orm/user.entity';

@Entity()
export class Match extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

    @Column()
      map: string;

    @ManyToOne(() => User, (user) => user.matchesHome)
      userHome: User;

    @ManyToOne(() => User, (user) => user.matchesForeign)
      userForeign: User;

    @ManyToOne(() => User, (user) => user.matchesWon)
      winner: User;

    @Column()
      userHomeScore: number;

    @Column()
      userForeignScore: number;

    @CreateDateColumn()
      timestamp: Date;
}