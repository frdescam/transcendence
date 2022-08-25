import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { AuthDto } from '../../auth/dto';
import { UserDTO } from '../orm/user.dto';
import { Friend } from "../orm/friend.entity";
import { User } from '../orm/user.entity';

// friends_repo not needed anymore, delete getFriends and follow here
@Injectable({})
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Friend)
    private friends_repo: Repository<Friend>
  ) {}
  //#region Part Leo
  async turnOn2FA(userId: number): Promise<void> {
		await this.userRepository.update(userId, {
			is2FActive: true,
		});
	  }

	async turnOff2FA(userId: number): Promise<void> {
		await this.userRepository.update(userId, {
			is2FActive: false,
			secretOf2FA: null,
		});
	  }

	async set2FASecret(secret: string, userId: number): Promise<void> {
		await this.userRepository.update(userId, {
			secretOf2FA: secret,
		});
	  }

	// should add something if id fails?
	async updateAvatar(filename: string, userId: number): Promise<User> {
	// return await this.userRepository.update(userId, {
	// 	avatar: filename,
	// });

	// should add something if id fails?
	const result = await this.userRepository.createQueryBuilder() // raw sql type
    .update({
		avatar: 'http://127.0.0.1:8080/api/user/avatar/'+filename,
    })
    .where({
        id: userId,
    })
    .returning('*')
    .execute();

	//console.log("result: ",result.raw[0]);
	// return result.raw[0];
	return this.sanitizeUser(result.raw[0]);
	//  return await this.userRepository.save({
	// 	id: userId,
	//  	avatar: filename,
	//  });
	}
  
	// should add something if id fails?
	async updatePseudo(new_pseudo: string, userId: number) : Promise<User | object> {
		// change return here
		const user: User = await this.userRepository.findOne({pseudo : new_pseudo});

		if (user)
			return {error: "pseudo already taken!"}
		
		console.log("updatePseudo: if undefined is good, user: ", user);
		
		const result = await this.userRepository.createQueryBuilder()
		.update({
			pseudo: new_pseudo,
		})
		.where({
			id: userId,
		})
		.returning('*')
		.execute();

		// const user : User = result.raw[0];
		
		console.log("result: ",result.raw[0]);
		//console.log(test_user, user, result.raw[0]);
		return this.sanitizeUser(result.raw[0]);
	}

	async follow(userId: number, follwedUserId: number) {
		const user : User = await this.userRepository.findOne({id: userId});
		const followedUser : User = await this.userRepository.findOne({id: follwedUserId});
		if (!user)
			return ;
        this.friends_repo.create({
            user: user,
            followedUser: followedUser,
            isPending: false
        })
    }

	async getFriends(userId : number): Promise<User[]> {
        const friendRelations = await this.friends_repo.find({
            where: {user: userId, isPending: false}
        })
        let friends: User[] = [];
        friendRelations.forEach(friendRelation => {
            friends.push(friendRelation.followedUser);
        });
        return friends;
	}

	async findOneComplete(user_dto: AuthDto): Promise<User> {
        // print this when testing multiple pseudos
        //console.log(await this.getUniquePseudo(user_dto.pseudo));
		//console.log(user_dto, await this.userRepository.findOne({where: user_dto}));
		return this.userRepository.findOne({where: user_dto}); // use where? // if auth breaks is this line
    }

	async sanitizeUser(user: User): Promise<User>
	{
		if (user) {
			delete user.fortytwo_id;
			delete user.refresh_token;
			//delete user.email; erase in entity
			//delete user.password; erase in entity
			//delete user.is2FActive;
			delete user.secretOf2FA;
		}
		return user;
	}

    async findOne(user_dto: AuthDto): Promise<User> {
		const user: User = await this.userRepository.findOne({where: user_dto});
		
		// delete user.fortytwo_id;
		// delete user.refresh_token;
		//delete user.email; erase in entity
		//delete user.password;
		//delete user.is2FActive;
		// delete user.secretOf2FA;

		return await this.sanitizeUser(user);
    }

	// async getOne(userId: number): Promise<User>
	// {
	// 	const user: User = await this.userRepository.findOne({id: userId});

	// 	delete user.fortytwo_id;
	// 	delete user.refresh_token;
	// 	//delete user.email; erase in entity
	// 	//delete user.password;
	// 	delete user.is2FActive;
	// 	delete user.secretOf2FA;

	// 	return user;
	// }

	// this is broken
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    // need to test more!
    // and use this when changing pseudo too not just register
    // cant have mutiple ppl with same pseudo nick, nickname
    private async getUniquePseudo(login: string): Promise<string> {
		const found: User = await this.userRepository.findOne({ where: {pseudo: login} }); // where not needed here

		if (!found)
            return login;

		//const last: User = await this.userRepository.findLastWithNameLike(login);

        // if last not needed then can erase Like include of typeorm
        const last: User = await this.userRepository.findOne({
			select: ['id'],
			where: { pseudo: Like(`${login}%`) },
			order: {
				id: 'DESC',
			},
		});

		return `${login}#${last?.id + 1}`;
	}

    async signup(user_dto: AuthDto): Promise<User> {
        user_dto.pseudo = await this.getUniquePseudo(user_dto.pseudo);
        console.log("new user: " ,user_dto);
        const user: User = this.userRepository.create({
			...user_dto,
		});
        //console.log(user);
		return this.userRepository.save(user);
    }

    async setRefreshToken(user: User, token: string): Promise<void> {
		this.userRepository.update(user.id, {
				refresh_token: token,
		});
	}

  
  //#region Part Clément
  getAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['blockedUsers', 'blockedUsersBy'] });
  }

  getOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: ['blockedUsers', 'blockedUsersBy']
    });
  }

  async create(data: UserDTO) {
    const user = this.userRepository.create(data);
    // user.password = await argon2.hash(user.password); // A hash pour la sécu
    await this.userRepository.save(user);
    return user;
  }

  async update(data: UserDTO) {
    const tempId = data.id;
    delete data.id;
    const update = await this.getOne(tempId);
    /*
    if (!await argon2.verify(update.password, data.password))
      data.password = await argon2.hash(data.password);
    */
    await this.userRepository.update({ id: tempId }, update);
  }

  async delete(data: UserDTO) {
    await this.userRepository.delete({ id: data.id });
    return { deleted: true };
    /*
    if (await argon2.verify(user.password, data.password)) {
      await this.userRepository.delete({ id: data.id });
      return { deleted: true };
    }
    return {
      error: 'Password don\'t recognize',
      deleted: false,
    };
    */
  }
  //#endregion
}
