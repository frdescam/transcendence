import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthDto } from '../dto'; // not needed for now
import { User } from 'src/users/orm/user.entity';
import { AuthService } from '../services/auth.service'; // update later

// Create token dto! 
// into its own file
export interface TokenPayload {
	sub: number;
	isSecondFactorAuthenticated?: boolean; // most likely not needed
}

@Injectable()
export class JwtAuth2FAStrategy extends PassportStrategy(Strategy, 'auth-jwt-2fa') {
  constructor(config: ConfigService, private readonly auth_svc: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request || !request.cookies)
            return null;
          return request.cookies?.isSecondFactorAuthenticated; // change to 2falogin cookie
        },
      ]),
      secretOrKey: config.get('JWT_AUTH_2FA_SECRET'),
    });
  }

  async validate(payload: TokenPayload): Promise<User> {
    //console.log(payload);
    return this.auth_svc.login({
      id: payload.sub,
    });
  }
}