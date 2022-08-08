import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/users/entities/user.entity';

import { AuthService } from '../services/auth.service';

 // request here is a socket
import { Socket } from 'socket.io'; 

 // request here is a socket
// add socket types

// Create token dto! 
    // into its own file
export interface TokenPayload {
    sub: number;
    isSecondFactorAuthenticated?: boolean; // most likely not needed
}

const tokenizeCookies = (str: string): any => { // returns object with cookies make interface
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
export class WsJwtStrategy extends PassportStrategy(Strategy, 'ws-jwt') {
	constructor(config: ConfigService, private readonly auth_svc: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: any) => { // request here is a socket
					//console.log(request, request.handshake.headers.cookie);
					const cookies: any = tokenizeCookies( // returns object with cookies make interface
						request.handshake.headers.cookie, // to test with requests change handshake here, req.headers.cookie shoudl exist and can then test if validate func works!
					);
					//console.log(cookies, cookies.Authentication, cookies.Refresh);
					return cookies.Authentication;
				},
			]),
			secretOrKey: config.get('JWT_AUTH_SECRET'),
			passReqToCallback: true,
			ignoreExpiration: true,
		});
	}

	async validate(request: Socket, payload: TokenPayload): Promise<User> { // request is socket
		//console.log(request['user']);
		// console.log(payload);
		// if (request['user']) {
		// 	const cookies: any = tokenizeCookies(request.handshake.headers.cookie);
		// 	console.log(cookies.Refresh);
		// 	return this.auth_svc.login({
		// 		id: request['user']?.id,
		// 		refresh_token: cookies.Refresh,
		// 	});
		// }
		// console.log("hello");
		return this.auth_svc.login({
			id: payload.sub,
		});
	}
}