import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { env } from 'process';

import { JwtAuthGuard } from '../guards/auth-jwt.guard';
import { JwtAuth2FAGuard } from '../guards/auth-jwt-2fa.guard';
import { JwtRefreshGuard } from '../guards/auth-jwt-refresh.guard';
import { OAuthGuard } from '../guards/auth.guard';
import { AuthService } from '../services/auth.service';
import { CookiesService } from '../services/cookies.service';
import { AuthUser } from '../decorators/auth-user.decorator';
import { User } from 'src/users/orm/user.entity';
import { TwoFactorAuthService } from '../services/twoFactorAuth.service';
import { AuthDto } from '../dto';
import { IsNumberString, Length } from 'class-validator';

const defaultAvatarUri = `${env.FRONTEND_HOST}/imgs/no_avatar.png`;

class twoFAPayload {
	@IsNumberString()
    @Length(6,6, {message: 'code must be exactly 6 characters long'})
	    code?: string;
}

@Controller()
export class AuthController {
        constructor(private auth_svc: AuthService, private auth2fa_svc: TwoFactorAuthService, private readonly cookies_svc: CookiesService, private config: ConfigService) { }

    @Post("auto_reg")
    async auto_reg(@Body() {id}, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
    {
        if (env.NODE_ENV !== 'developpement')
            throw new UnauthorizedException('developpement API is disabled in production mode');

        const user : User = await this.auth_svc.login({id: id});

        if (user)
            return "already exists"; // check dis error code

        const reg : AuthDto = {
            id: id,
            fortytwo_id: id,
            pseudo: "sample" + id,
            email: "sample" + id,
			avatar: defaultAvatarUri,
        };

        return await this.auth_svc.signup(reg);
    }

    @Post("auto_login")
    async auto_login(@Body() {id}, @Req() request: Request) {
        if (env.NODE_ENV !== 'developpement')
            throw new UnauthorizedException('developpement API is disabled in production mode');

        let user : User = await this.auth_svc.login({id: id});

        if (!user)
        {
            const reg : AuthDto = {
                id: id,
                fortytwo_id: id,
                pseudo: "sample" + id,
                email: "sample" + id,
                avatar: defaultAvatarUri
            };
            user = await this.auth_svc.signup(reg);
        }

        if (user.is2FActive === true) // use boolean in db instead of string?
        {
            const twoFA_token = this.cookies_svc.get2FAJwtTokenCookie(user,);
            request.res.cookie("isSecondFactorAuthenticated", twoFA_token, {maxAge: 86400 * 1000, // maxAge .env
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
            });

            return {
				user_id: user.id,
				two_factor_enabled: true,
			};
        }

        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh_token = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

		this.auth_svc.refresh(user, refresh_token);
        this.auth_svc.status(user, true);

        request.res.cookie("Authentication", auth_token, {maxAge: 86400 * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        request.res.cookie("Refresh", refresh_token, {maxAge: 86400 * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        return user;
    }

    @UseGuards(JwtAuthGuard)
	@Get('2FA/deactivate')
	async deactivate2FA(@AuthUser() user: User): Promise<void> {
		await this.auth2fa_svc.turnOff2FA(
			user.id,
		);
	}

    @UseGuards(JwtAuthGuard)
    @Get('2FA/generate')
    async generate(@Res() response: Response, @AuthUser() user: User) {
        if (user.is2FActive === true) {
            response.send({error: "2FA already active, on this account."});
            return ;
        }
        const otpauthUrl = await this.auth2fa_svc.generate2FASecret(user);
        return this.auth2fa_svc.pipeQrCodeStream(response, otpauthUrl);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2FA/turn-on')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async turnOnTwoFactorAuthentication(
        @AuthUser() user: User, @Body() twoFACode : twoFAPayload) {
    if (user.is2FActive === true)
        return {error: "2FA already active, on this account."};

      const isCodeValid = this.auth2fa_svc.is2FACodeValid(
        twoFACode.code,
        user,
      );

      if (!isCodeValid)
        return {error: "2FA code invalid."};
      
      await this.auth2fa_svc.turnOn2FA(user.id);

      return {
		two_factor_enabled: true,
      }
    }

    @UseGuards(JwtAuth2FAGuard)
    @Post('2FA/login')
    @UsePipes(new ValidationPipe({ whitelist: true }))
	async login2FA(
		@Body() twoFACode: twoFAPayload,
		@Req() request: Request,
        @AuthUser() user: User) {
		const isCodeValid =
			this.auth2fa_svc.is2FACodeValid(
				twoFACode.code,
				user,
			);

		if (!isCodeValid)
            return {error: "2FA code invalid."};

        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh_token = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

		this.auth_svc.refresh(user, refresh_token);
        this.auth_svc.status(user, true);

        request.res.cookie("Authentication", auth_token, {maxAge: this.config.get('JWT_AUTH_LIFETIME') * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        request.res.cookie("Refresh", refresh_token, {maxAge: this.config.get('JWT_REFRESH_LIFETIME') * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        request.res.clearCookie("isSecondFactorAuthenticated", {maxAge: 0,
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

		return {
			two_factor_enabled: user.is2FActive,
		};
	}
    
    @UseGuards(OAuthGuard)
    @Get("login")
    async login(@AuthUser() user: User, @Req() request: Request, @Res() res: Response) {
        if (user.is2FActive === true) {
            const twoFA_token = this.cookies_svc.get2FAJwtTokenCookie(user,);
            request.res.cookie("isSecondFactorAuthenticated", twoFA_token, {maxAge: 300 * 1000, // maxAge .env
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
            });

            res.redirect(`${env.FRONTEND_HOST}/login/2fa`);

            return {
				user_id: user.id,
				two_factor_enabled: true,
			};
        }

        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh_token = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

		this.auth_svc.refresh(user, refresh_token);
        this.auth_svc.status(user, true);

        request.res.cookie("Authentication", auth_token, {maxAge: this.config.get('JWT_AUTH_LIFETIME') * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        request.res.cookie("Refresh", refresh_token, {maxAge: this.config.get('JWT_REFRESH_LIFETIME') * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        res.redirect(`${env.FRONTEND_HOST}/logging`);

        return {
			two_factor_enabled: false,
		};
    }

    @UseGuards(JwtAuthGuard)
    @Get("logged")
    async logged(@AuthUser() user: User, @Req() request: Request): Promise<any> {
        this.auth_svc.status(user, true);
        return user;
    }

    @UseGuards(JwtRefreshGuard)
    @Get("refresh")
    async refresh(@AuthUser() user: User, @Req() request: Request) {
        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);

        request.res.cookie('Authentication', auth_token, {maxAge: 86400 * 1000, // in ms // maxAge use JWT_AUTH_LIFETIME of env * 1000
        sameSite: 'strict',
        httpOnly: true,
        path: '/',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get("logout")
    async logout(@AuthUser() user: User, @Req() request: Request) {
		this.auth_svc.refresh(user, null);
        this.auth_svc.status(user, false);

        request.res.clearCookie("Authentication", {maxAge: 0,
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        request.res.clearCookie("Refresh", {maxAge: 0,
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        return "logged out!";
    }
}