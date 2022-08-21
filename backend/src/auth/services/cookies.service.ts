import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/orm/user.entity';

// TODO here add types to payloads
// create dtos

export enum CookieType {
	AUTHENTICATION = 'Authentication',
	REFRESH = 'Refresh',
	sup = 'isSecondFactorAuthenticated',
}

@Injectable({})
export class CookiesService {
  constructor(private jwt_svc: JwtService, private config: ConfigService,) {}

  getAuthJwtTokenCookie(
    user: User,
  ): { token: string; cookie: string } { // create dtos
    const secret = this.config.get('JWT_AUTH_SECRET');
    const lifetime = this.config.get('JWT_AUTH_LIFETIME');
    const payload: any = { sub: user.id }; // any for now, create dto for this?

    const token = this.getJwtToken(payload, secret, lifetime);
    const cookie = this.getJwtCookie(CookieType.AUTHENTICATION, token, lifetime);  // if using poc of cookie this not needed
    //console.log(cookie);

    return { token: token, cookie: cookie };
  }

  getRefreshJwtTokenCookie(
    user: User,
  ): { token: string; cookie: string } { // this will return only the token, // create dtos
    const secret = this.config.get('JWT_REFRESH_SECRET');
    const lifetime = this.config.get('JWT_REFRESH_LIFETIME');
    const payload: any = { sub: user.id }; // any for now, create dto for this? // user_id or id?

    const token = this.getJwtToken(payload, secret, lifetime);
    const cookie = this.getJwtCookie(CookieType.REFRESH, token, lifetime); // if using poc of cookie this not needed

    return { token: token, cookie: cookie };
  }

  get2FAJwtTokenCookie(
    user: User,
  ): { token: string; cookie: string } { // this will return only the token, // create dtos
    const secret = this.config.get('JWT_AUTH_2FA_SECRET');
    const lifetime = this.config.get('JWT_AUTH_2FA_LIFETIME'); //change to 5 mins
    const payload: any = { sub: user.id, isSecondFactorAuthenticated: 'true'}; // any for now, create dto for this? // user_id or id?

    const token = this.getJwtToken(payload, secret, lifetime);
    const cookie = this.getJwtCookie(CookieType.sup, token, lifetime); // if using poc of cookie this not needed

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