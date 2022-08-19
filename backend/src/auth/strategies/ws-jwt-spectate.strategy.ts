import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service';

export interface TokenPayload {
    sub: number;
}

// TokenPayload will be imported from
// import { TokenPayload } from '../dto/tokenPayload.dto';
// this branch doesnt have it, was updated later.

const tokenizeCookies = (str: string): any => {
	let cookieObject = {};
	if (str) {
		const strToArray = str.split(';').map((str) => str.replace(/\s/g, ''));
		strToArray.forEach((el) => {
			const tmp = el.split('=');
			cookieObject[tmp[0]] = tmp[1];
		});
	}
	return cookieObject;
};

@Injectable()
export class WsJwtSpectateStrategy extends PassportStrategy(Strategy, 'ws-jwt-spectate') {
	constructor(config: ConfigService, private readonly auth_svc: AuthService) {
    super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: any) => {
					const cookies: any = tokenizeCookies(
						request.handshake.headers.cookie,
					);
					return cookies.Authentication;
				},
			]),
			secretOrKey: config.get('JWT_AUTH_SECRET'),
			ignoreExpiration: true,
		});
	}

	async validate(payload: TokenPayload): Promise<User> {
    return this.auth_svc.login({
			id: payload.sub,
	  });
	}
}