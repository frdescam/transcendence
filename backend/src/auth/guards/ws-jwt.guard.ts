import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class WsJwtGuard extends AuthGuard('ws-jwt') {
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
        {
            console.log("error: ", error, user);
			throw new UnauthorizedException('Invalid JWT WS Token.');
        }
		return user;
	}
}