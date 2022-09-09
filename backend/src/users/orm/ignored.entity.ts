import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/users/orm/user.entity';

@Entity()
export class Ignore extends BaseEntity {
    @PrimaryGeneratedColumn()
      id: number;

	@ManyToOne(() => User, (user) => user.blockedUsers, {
	  eager: true,
	})
	  user: User;

	@ManyToOne(() => User, (user) => user.blockedUsersBy, {
	  eager: true,
	})
	  target: User;
}