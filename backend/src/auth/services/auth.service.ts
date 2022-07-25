import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/services/users.service";
import { AuthDto } from '../dto';

@Injectable({})
export class AuthService {
    constructor(private jwt_svc: JwtService, private readonly users_svc: UsersService) {}

    // could have used jwt_svc.verify instead of keeping refresh_token in db, how?
    async login(user_dto: AuthDto): Promise<User> {
        //this.jwt_svc.verify(token);
        const user: User = await this.users_svc.findOne(user_dto);

        //console.log(user, user_dto);

		if (!user)
            return undefined;

        // this in case of password if we use dat shit
		// if (data.password && !(await this.hashVerify(data.password, user.password)))
		// 	return undefined;

		 if (user_dto.refresh_token && !(user_dto.refresh_token === user.refresh_token)) // hash refresh_token?
		 	//!(await this.hashVerify(data.refresh_token, user.refresh_token))
		 	    return undefined;

		return user;
    }

    // erase later
    async test_users(user_dto: AuthDto) {
        this.users_svc.getFriends(user_dto.id);
    }

    async signup(user_dto: AuthDto): Promise<User> {
        return this.users_svc.signup(user_dto);
    }

    async refresh(user: User, token: string): Promise<void> {
		await this.users_svc.setRefreshToken(user, token);
	}

    async logout(user: User): Promise<void> {
		return this.users_svc.setRefreshToken(user, null);
	}
}