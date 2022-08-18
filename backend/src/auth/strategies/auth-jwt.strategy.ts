import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { TokenPayload } from '../dto/tokenPayload.dto';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service';


@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'auth-jwt') {
	constructor(config: ConfigService, private readonly auth_svc: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					if (!request || !request.cookies)
						return null;
					return request.cookies?.Authentication;
				},
			]),
			secretOrKey: config.get('JWT_AUTH_SECRET'),
		});
	}

	async validate(payload: TokenPayload): Promise<User> {
		//console.log(payload);
		return this.auth_svc.login({
			id: payload.sub,
		});
	}
}