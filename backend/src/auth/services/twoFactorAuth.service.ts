import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "../../users/entities/user.entity";
import { UsersService } from "../../users/services/users.service";
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

// TODO here add types to payloads, adn to returns
// create dtos

@Injectable({})
export class TwoFactorAuthService {
    constructor(private readonly users_svc: UsersService, private config: ConfigService,) {}

    async generate2FASecret(user: User) {
        const secret = authenticator.generateSecret();
     
        const otpauthUrl = authenticator.keyuri(user.email, this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
     
        await this.users_svc.set2FASecret(secret, user.id);
        
        // why return secret here?
        /*
        return {
            secret,
            otpauthUrl
          }
        */
        
        return otpauthUrl;
    }

    async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
      }

      public is2FACodeValid(twoFACode: string, user: User) {
        return authenticator.verify({
          token: twoFACode,
          secret: user.secretOf2FA,
        })
      }
    
      // could be void cant fail
      async turnOn2FA(userId: number)//: Promise<void> {
		{
			// change return here
		return this.users_svc.turnOn2FA(userId);
	  }

      // could be void cant fail
	  async turnOff2FA(userId: number) { //: Promise<void> {
			// change return here
		return this.users_svc.turnOff2FA(userId);
	  }
}