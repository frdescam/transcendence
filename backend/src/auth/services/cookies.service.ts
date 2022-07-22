import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/entities/user.entity";

// TODO here add types to payloads
// create dtos

export enum CookieType {
	AUTHENTICATION = 'Authentication',
	REFRESH = 'Refresh',
	TWOFA = 'isSecondFactorAuthenticated',
}

@Injectable({})
export class CookiesService {
    constructor(private jwt_svc: JwtService, private config: ConfigService,) {}

	getAuthJwtTokenCookie(
		user: User,
	):  string  { // create dtos
		const secret = this.config.get('JWT_AUTH_SECRET');
		const lifetime = this.config.get('JWT_AUTH_LIFETIME')
		const payload: any = { sub: user.id }; // any for now, create dto for this?

		const token = this.getJwtToken(payload, secret, lifetime);
        //console.log(cookie);

		return token;
	}

    getRefreshJwtTokenCookie(
		user: User,
	):  string { // this will return only the token, // create dtos
		const secret = this.config.get('JWT_REFRESH_SECRET');
		const lifetime = this.config.get('JWT_REFRESH_LIFETIME');
		const payload: any = { sub: user.id }; // any for now, create dto for this? // user_id or id?

		const token = this.getJwtToken(payload, secret, lifetime);

		return token;
	}

	get2FAJwtTokenCookie(
		user: User,
	):  string { // this will return only the token, // create dtos
		const secret = this.config.get('JWT_AUTH_2FA_SECRET');
		const lifetime = this.config.get('JWT_AUTH_2FA_LIFETIME'); //change to 5 mins
		const payload: any = { sub: user.id, isSecondFactorAuthenticated: "true"}; // any for now, create dto for this? // user_id or id?

		const token = this.getJwtToken(payload, secret, lifetime);

		return token;
	}

	private getJwtToken(
		payload: string | object, // why object here? // should be same dto i need to create for the payload in l38 (return object of func getRefreshJwtTokenCookie), and payload l27,41
		secret: string,
		lifetime: string,
	): string {
		return this.jwt_svc.sign(payload, {
			secret: secret,
			expiresIn: `${lifetime}s`,
		});
	}
}