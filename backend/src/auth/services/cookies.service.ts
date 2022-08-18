import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/entities/user.entity";

interface cookiePayload {
	sub: number,
	isSecondFactorAuthenticated?: boolean,
}

@Injectable({})
export class CookiesService {
    constructor(private jwt_svc: JwtService, private config: ConfigService,) {}

	getAuthJwtTokenCookie(
		user: User,
	):  string  {
		const secret = this.config.get('JWT_AUTH_SECRET');
		const lifetime = this.config.get('JWT_AUTH_LIFETIME')
		const payload: cookiePayload = { sub: user.id };

		const token = this.getJwtToken(payload, secret, lifetime);

		return token;
	}

    getRefreshJwtTokenCookie(
		user: User,
	):  string {
		const secret = this.config.get('JWT_REFRESH_SECRET');
		const lifetime = this.config.get('JWT_REFRESH_LIFETIME');
		const payload: cookiePayload = { sub: user.id };

		const token = this.getJwtToken(payload, secret, lifetime);

		return token;
	}

	get2FAJwtTokenCookie(
		user: User,
	):  string {
		const secret = this.config.get('JWT_AUTH_2FA_SECRET');
		const lifetime = this.config.get('JWT_AUTH_2FA_LIFETIME'); //change to 5 mins
		const payload: cookiePayload = { sub: user.id, isSecondFactorAuthenticated: true};

		const token = this.getJwtToken(payload, secret, lifetime);

		return token;
	}

	private getJwtToken(
		payload: cookiePayload,
		secret: string,
		lifetime: string,
	): string {
		return this.jwt_svc.sign(payload, {
			secret: secret,
			expiresIn: `${lifetime}s`,
		});
	}
}