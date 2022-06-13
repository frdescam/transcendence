import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthDto } from './dto';


// add jwt later

@Injectable({})
export class AuthService {
    constructor(private jwt: JwtService,) {}
    auth() {
        // if user exist then log in.
        // call signin

        // if user doesnt exist then create user in db
        // call register

        // return JWT
    }

    test(user_dto: AuthDto) {
        console.log(user_dto);
    }
}