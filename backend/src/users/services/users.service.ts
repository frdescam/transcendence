import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Length } from "class-validator"; // what
import { Match } from "src/match.entity";
import { MatchDTO } from "src/match/orm/match.dto";
import { Like, MoreThanOrEqual, Not, Repository } from "typeorm";

import { AuthDto } from '../../auth/dto';
import { Friend } from "../entities/friend.entity";
import { User } from "../entities/user.entity";


@Injectable({})
export class UsersService {
	constructor (
        @InjectRepository(User)
        private readonly users_repo: Repository<User>,
        @InjectRepository(Friend)
        private friends_repo: Repository<Friend>,
        @InjectRepository(Match)
        private match_repo: Repository<Match>) {}

	async turnOn2FA(userId: number): Promise<void> {
		await this.users_repo.update(userId, {
			is2FActive: true,
		});
	  }

	  async turnOff2FA(userId: number): Promise<void> {
		await this.users_repo.update(userId, {
			is2FActive: false,
			secretOf2FA: null,
		});
	  }

	async set2FASecret(secret: string, userId: number): Promise<void> {
		await this.users_repo.update(userId, {
			secretOf2FA: secret,
		});
	  }

	// do we even need to return the user here?
	async updateAvatar(filename: string, userId: number): Promise<User> {
	// return await this.users_repo.update(userId, {
	// 	avatar: filename,
	// });

	const result = await this.users_repo.createQueryBuilder() // raw sql type
    .update({
		avatar: filename,
    })
    .where({
        id: userId,
    })
    .returning('*')
    .execute()

	//console.log("result: ",result.raw[0]);
	return result.raw[0];
	//  return await this.users_repo.save({
	// 	id: userId,
	//  	avatar: filename,
	//  });
	}
  
	async updatePseudo(new_pseudo: string, userId: number) : Promise<User | object> {
		// change return here
		const user: User = await this.users_repo.findOne({pseudo : new_pseudo});

		if (user)
			return {error: "pseudo already taken!"}
		
		console.log("user: ", user);
		
		const result = await this.users_repo.createQueryBuilder()
		.update({
			pseudo: new_pseudo,
		})
		.where({
			id: userId,
		})
		.returning('*')
		.execute()
		
		console.log("result: ",result.raw[0]);
		//console.log(test_user, user, result.raw[0]);
		return result.raw[0];
	}

	async follow(userId: number, follwedUserId: number) {
		const user : User = await this.users_repo.findOne({id: userId});
		const followedUser : User = await this.users_repo.findOne({id: follwedUserId});
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
	
    async findOne(user_dto: AuthDto): Promise<User> {
        // print this when testing multiple pseudos
        //console.log(await this.getUniquePseudo(user_dto.pseudo));
		//console.log(user_dto, await this.users_repo.findOne({where: user_dto}));
		return this.users_repo.findOne({where: user_dto}); // use where? // if auth breaks is this line
    }

	async getOne(userId: number): Promise<User>
	{
		return this.users_repo.findOne({id: userId});
	}

    async findAll(): Promise<User[]> {
        return this.users_repo.find();
    }

    // need to test more!
    // and use this when changing pseudo too not just register
    // cant have mutiple ppl with same pseudo nick, nickname
    private async getUniquePseudo(login: string): Promise<string> {
		const found: User = await this.users_repo.findOne({ where: {pseudo: login} }); // where not needed here

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

    private computeXp(nbWon: number, nbLost: number): number {
        return nbWon * 0.1 + nbLost * 0.0075;
    }

    private computeRatio(nbWon: number, nbLost: number): number {
        const ratio :number = (nbWon / (nbWon + nbLost)) * 100;
        console.log(ratio);
        if (isNaN(ratio) || !isFinite(ratio))
            return 0;
        return parseInt(ratio.toString());
    }

    async updateUserStats(userId: number) {
        const nbWon = await this.match_repo.count({
            where: {
                winner: userId
            }
        });

        const nbLost = await this.match_repo.count({
            where: [
                { userForeign: userId, winner: Not(userId) },
                { userHome: userId, winner: Not(userId) }
            ],
        });

        console.log("user : ", userId, "nbWon : ", nbWon, "nbLost : ", nbLost);

        this.users_repo.update(userId, {
            xp: this.computeXp(nbWon, nbLost),
            ratio: this.computeRatio(nbWon, nbLost),
        });
    }

    async signup(user_dto: AuthDto): Promise<User> {
        user_dto.pseudo = await this.getUniquePseudo(user_dto.pseudo);
        console.log("new user: " ,user_dto);
        user_dto.rank = await this.users_repo.count({}) + 1;
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