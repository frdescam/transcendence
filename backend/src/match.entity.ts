import { BaseEntity } from "typeorm";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Match extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.matchesAtHome)
    userAtHome: User;

    @ManyToOne(() => User, (user) => user.matchesAsForeigner)
    userAsForeigner: User;

    @Column()
    user1Score: number;

    @Column()
    user2Score: number;

    @CreateDateColumn()
    timestamp: Date;
}