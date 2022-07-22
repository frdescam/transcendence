import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuth2FAGuard extends AuthGuard('auth-jwt-2fa') {
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
        {
            console.log("2fa error: ", error, user);
            throw new UnauthorizedException('Invalid JWT Token.');
        }
		return user;
	}
}