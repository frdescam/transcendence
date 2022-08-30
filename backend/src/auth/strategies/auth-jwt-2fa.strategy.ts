import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/users/orm/user.entity';
import { TokenPayload } from '../dto/tokenPayload.dto';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtAuth2FAStrategy extends PassportStrategy(Strategy, 'auth-jwt-2fa') {
	constructor(config: ConfigService, private readonly auth_svc: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					if (!request || !request.cookies)
						return null;
					return request.cookies?.isSecondFactorAuthenticated;
				},
			]),
			secretOrKey: config.get('JWT_AUTH_2FA_SECRET'),
		});
	}

	async validate(payload: TokenPayload): Promise<User> {
		return this.auth_svc.login({
			id: payload.sub,
		});
	}
}