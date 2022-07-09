import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";

// is auth dto needed here?
import { AuthDto } from '../../auth/dto';
import { User } from "../entities/user.entity";


@Injectable({})
export class UsersService {
    constructor(@InjectRepository(User)
    private readonly users_repo: Repository<User>,) {}

    async findOne(user_dto: AuthDto): Promise<User> {
        // print this when testing multiple pseudos
        //console.log(await this.getUniquePseudo(user_dto.pseudo));
		return this.users_repo.findOne({where: user_dto});
		// return this.users_repo.findOne({
        //     where: {
        //         fortytwo_id: user_dto.fortytwo_id,
        //     }
        // });
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
        console.log(user_dto);
        const user: User = this.users_repo.create({
			...user_dto,
		});

        //console.log(user);
		return this.users_repo.save(user);
    }
}