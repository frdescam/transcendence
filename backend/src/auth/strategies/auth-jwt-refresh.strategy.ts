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
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'auth-jwt-refresh',
) {
  constructor(config: ConfigService, private readonly auth_svc: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request || !request.cookies)
            return null;
          return request.cookies?.Refresh;
        },
      ]),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

	async validate(request: Request, payload: TokenPayload): Promise<User> {
		return this.auth_svc.login({
			id: payload.sub,
			refresh_token: request.cookies?.Refresh,
		});
	}
}