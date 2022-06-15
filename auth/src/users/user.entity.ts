import {Column, Entity, PrimaryColumn} from "typeorm"

// delete this // use the entity of franco

@Entity()
export class User{
    @PrimaryColumn()
    id: number;

    @Column()
    login: string;
}