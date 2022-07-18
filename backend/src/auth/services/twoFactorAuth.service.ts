import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "../../users/entities/user.entity";
import { UsersService } from "../../users/services/users.service";
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

// TODO here add types to payloads
// create dtos

@Injectable({})
export class TwoFactorAuthService {
    constructor(private readonly users_svc: UsersService, private config: ConfigService,) {}

    async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
     
        const otpauthUrl = authenticator.keyuri(user.email, this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
     
        await this.users_svc.setTwoFactorAuthenticationSecret(secret, user.id);
     
        return {
          secret,
          otpauthUrl
        }
    }

    async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
      }
}