import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.matches)
    user1: User;

    @ManyToOne(() => User, (user) => user.matches)
    user2: User;

    @Column()
    user1Score: number;

    @Column()
    user2Score: number;

    @CreateDateColumn()
    timestamp: Date;
}