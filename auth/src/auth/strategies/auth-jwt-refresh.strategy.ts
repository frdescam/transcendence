import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthDto } from '../dto'; // not needed for now
import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service'; // update later
//import { TokenPayload } from '../interfaces/token-payload.interface'; // update later

// Create token dto! 
    // into its own file
export interface TokenPayload {
	user_id: number;
	isSecondFactorAuthenticated?: boolean;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'auth-jwt-refresh',
) {
	constructor(config: ConfigService, private readonly auth_svc: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request.cookies?.Refresh;
				},
			]),
			secretOrKey: config.get('JWT_REFRESH_SECRET'),
			passReqToCallback: true,
		});
	}

	async validate(request: Request, payload: TokenPayload): Promise<User> { // if refresh token not needed then request here not needed!
		return this.auth_svc.login({
			id: payload.user_id,
			//refresh_token: request.cookies?.Refresh, if we add this, then has to be added to user.entity.ts too!
		});
	}
}