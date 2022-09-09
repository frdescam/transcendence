import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/users/orm/user.entity';
import { TokenPayload } from '../dto/tokenPayload.dto';
import { AuthService } from '../services/auth.service';

const tokenizeCookies = (str: string): any => {
  const cookieObject = {};
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