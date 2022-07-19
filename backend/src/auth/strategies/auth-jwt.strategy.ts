import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthDto } from '../dto'; // not needed for now
import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service'; // update later
//import { TokenPayload } from '../dto/token-payload.interface'; // update later

// Create token dto! 
    // into its own file
export interface TokenPayload {
	sub: number;
	isSecondFactorAuthenticated?: boolean; // most likely not needed
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'auth-jwt') {
	constructor(config: ConfigService, private readonly auth_svc: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request.cookies?.Authentication;
				},
			]),
			secretOrKey: config.get('JWT_AUTH_SECRET'),
		});
	}

	async validate(payload: TokenPayload): Promise<User> {
		return this.auth_svc.login({
			id: payload.sub,
		});
	}
}