import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/services/users.service";
import { AuthDto } from '../dto';

@Injectable({})
export class AuthService {
    constructor(private jwt_svc: JwtService, private readonly users_svc: UsersService) {}

    async login(user_dto: AuthDto): Promise<User> {
        const user: User = await this.users_svc.findOne(user_dto);

        //console.log(user);

		if (!user)
            return undefined;

        // this in case of password if we use dat shit

		// if (data.password && !(await this.hashVerify(data.password, user.password)))
		// 	return undefined;

        // add jwt with refresh here!

		 if (user_dto.refresh_token && !(user_dto.refresh_token === user.refresh_token)) // hash refresh_token!
		 	//!(await this.hashVerify(data.refresh_token, user.refresh_token))
		 	    return undefined;

		return user;
    }

    async signup(user_dto: AuthDto): Promise<User> {
        return this.users_svc.signup(user_dto);
    }

    async refresh(user: User, token: string)//: Promise<void> {
    {
		await this.users_svc.setRefreshToken(user, token); // has token!
	}

    async logout(user: User): Promise<void> {
		return this.users_svc.setRefreshToken(user, null);
	}
}