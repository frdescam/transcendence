import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Length } from "class-validator";
import { Like, Repository } from "typeorm";

import { AuthDto } from '../../auth/dto';
import { Friend } from "../entities/friend.entity";
import { User } from "../entities/user.entity";


@Injectable({})
export class UsersService {
    constructor (
        @InjectRepository(User)
        private readonly users_repo: Repository<User>,
        @InjectRepository(Friend)
        private friends_repo: Repository<Friend>) {}

	// add return type!!!
	async turnOn2FA(userId: number)//: Promise<void> {
		{
			// change return here
		return this.users_repo.update(userId, {
			is2FActive: true,
		});
	  }

	// add return type!!!
	  async turnOff2FA(userId: number) {
			// change return here
		return this.users_repo.update(userId, {
			is2FActive: false,
			secretOf2FA: null,
		});
	  }

	// add return type!!!
	async set2FASecret(secret: string, userId: number) {
			// change return here
		return this.users_repo.update(userId, {
			secretOf2FA: secret,
		});
	  }

    async follow(userId: number, follwedUserId: number) {
        this.friends_repo.create({
            user: userId,
            followedUser: follwedUserId,
            isPending: false
        })
    }

	// check if works
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

    async findOne(user_dto: AuthDto): Promise<User> {
        // print this when testing multiple pseudos
        //console.log(await this.getUniquePseudo(user_dto.pseudo));
		//console.log(user_dto, await this.users_repo.findOne({where: user_dto}));
		return this.users_repo.findOne({where: user_dto}); // if multiple pseudos r the same, does this work? // use this id: user_dto.id?
		// return this.users_repo.findOne({
        //     where: {
        //         fortytwo_id: user_dto.fortytwo_id,
        //     }
        // });
    }

    async findAll(): Promise<User[]> {
        return this.users_repo.find();
    }

    // need to test more!
    // and use this when changing pseudo too not just register
    // cant have mutiple ppl with same pseudo nick, nickname
    private async getUniquePseudo(login: string): Promise<string> {
		const found: User = await this.users_repo.findOne({ where: {pseudo: login} });

		if (!found)
            return login;

		//const last: User = await this.users_repo.findLastWithNameLike(login);

        // if last not needed then can erase Like include of typeorm
        const last: User = await this.users_repo.findOne({
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
        const user: User = this.users_repo.create({
			...user_dto,
		});
        //console.log(user);
		return this.users_repo.save(user);
    }

    async setRefreshToken(user: User, token: string): Promise<void> {
		this.users_repo.update(user.id, {
				refresh_token: token,
		});
	}
}