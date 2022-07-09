import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../users/entities/user.entity";

// TODO here add types to payloads
// create dtos

// create its own dto?
import { AuthDto } from '../dto';

// is refresh even needed?

export enum CookieType {
	AUTHENTICATION = 'Authentication',
	REFRESH = 'Refresh',
}

@Injectable({})
export class CookiesService {
    constructor(private jwt_svc: JwtService, private config: ConfigService,) {}

	getAuthJwtTokenCookie(
		user: User,
	): { token: string; cookie: string } {
		const secret = this.config.get('JWT_AUTH_SECRET');
		const lifetime = this.config.get('JWT_AUTH_LIFETIME')
		const payload: any = { user_id: user.id }; // any for now, create dto for this?

		const token = this.getJwtToken(payload, secret, lifetime);
		const cookie = this.getJwtCookie(CookieType.AUTHENTICATION, token, lifetime);
        //console.log(cookie);

		return { token: token, cookie: cookie };
	}

    getRefreshJwtTokenCookie(
		user: User,
	): { token: string; cookie: string } {
		const secret = this.config.get('JWT_REFRESH_SECRET');
		const lifetime = this.config.get('JWT_REFRESH_LIFETIME')
		const payload: any = { user_id: user.id }; // any for now, create dto for this? // user_id or id?

		const token = this.getJwtToken(payload, secret, lifetime);
		const cookie = this.getJwtCookie(CookieType.REFRESH, token, lifetime);

		return { token: token, cookie: cookie };
	}

    // most likely not needed anymore!
	getJwtClearCookies(): string[] {
		return [
			this.getJwtCookie(CookieType.AUTHENTICATION, '', '0'),
			this.getJwtCookie(CookieType.REFRESH, '', '0'),
		];
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

    // most likely not needed anymore!
	private getJwtCookie(type: string, token: string, lifetime: string): string {
		return `${type}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${lifetime}`;
	}
}