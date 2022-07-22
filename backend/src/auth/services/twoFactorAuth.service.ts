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

    async generate2FASecret(user: User) : Promise<string> {
        const secret : string = authenticator.generateSecret();
        const otpauthUrl : string = authenticator.keyuri(user.email, this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
        await this.users_svc.set2FASecret(secret, user.id);
        return otpauthUrl;
    }

    // change dis? response bad
    // what the return type of dis
    async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
      }

    is2FACodeValid(twoFACode: string, user: User) : boolean {
        if (user.secretOf2FA === null)
                return false;
        return authenticator.verify({
          token: twoFACode,
          secret: user.secretOf2FA,
        })
    }
    
    async turnOn2FA(userId: number): Promise<void> {
      await this.users_svc.turnOn2FA(userId);
	  }

	  async turnOff2FA(userId: number) : Promise<void> {
		  await this.users_svc.turnOff2FA(userId);
	  }
}