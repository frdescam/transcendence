import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

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

// add async to route and stuff

interface twoFAPayload {
	code?: string;
}

@Controller()
export class AuthController {
        constructor(private auth_svc: AuthService, private auth2fa_svc: TwoFactorAuthService, private readonly cookies_svc: CookiesService, private config: ConfigService) { }

    @Post("auto_reg")
    async auto_reg(@Body() {id}, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
    {
        const user : User = await this.auth_svc.login({id: id});

        if (user)
            return "already exists"; // check dis error code

        const reg : AuthDto = {
            id: id,
            fortytwo_id: id,
            pseudo: "sample" + id,
            email: "sample" + id,
			avatar: 'http://127.0.0.1:8080/public/no_avatar.png',
        };

        return await this.auth_svc.signup(reg);
    }

    // to log in without auth42 for insomnia
    // code to ignore 2FA too, need to add this
    // add register too?
    @Post("auto_login")
    async auto_login(@Body() {id}, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
    {
        let user : User = await this.auth_svc.login({id: id});

        console.log(user);
        if (!user)
            return null;
            //user = await this.auth_svc.signup({id: id});

        // if 2FA activated return obj to frontend to display 2FA to user, else set cookies with jwt (if logged in) and return to frontend obj two_factor_enabled: false.
        if (user.is2FActive === true) // use boolean in db instead of string?
        {
            const twoFA_token = this.cookies_svc.get2FAJwtTokenCookie(user,);
            request.res.cookie("isSecondFactorAuthenticated", twoFA_token, {maxAge: 86400 * 1000, // maxAge .env
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
            });

            // here add jwt cookie that tells the server that user tried to log in, make it available for 5 mins after that guard in /2fa/login will return 401.
            return { // maybe like i add a cookie with id here its not necessary to return to the frontend the id of the user.
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

        // here call function that will update the status in our db to online, and update the refresh_token for the token
		this.auth_svc.refresh(user, refresh_token);

        // Add cookies here if not 2FA
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

        // return if 2FA or if logged to front end here! with a json obj
        return {
			two_factor_enabled: false,
		};
    }

    @UseGuards(JwtAuthGuard)
	@Get('2FA/reset')
	async reset2FA(@Res() response: Response, @AuthUser() user: User): Promise<void> {
        await this.deactivate2FA(user);
        return await this.generate(response, user);
	}

    // this shoudlnt return null? cant fail so could be, but frontend wont knwo if dis worked
    @UseGuards(JwtAuthGuard)
	@Get('2FA/deactivate')
	async deactivate2FA(@AuthUser() user: User): Promise<void> {
		await this.auth2fa_svc.turnOff2FA(
			user.id,
		);
	}

    // using response is bad, change this
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

    // receive 2FA code first time to check if its correct, if it is correct updates user db (activates 2FA). if fails return error.
    @UseGuards(JwtAuthGuard)
    @Post('2FA/turn-on')
    async turnOnTwoFactorAuthentication(
        @AuthUser() user: User, @Body() twoFACode : twoFAPayload // : TwoFactorAuthenticationCodeDto // create 2FA dto && add return that 2FA is activated
    ) {
    // if secret is in db & turn on is in db then this shouldnt work, just at the start
    if (user.is2FActive === true)
        return {error: "2FA already active, on this account."};

      const isCodeValid = this.auth2fa_svc.is2FACodeValid(
        twoFACode.code,
        user,
      );

      // if code sent failed 
      if (!isCodeValid)
        return {error: "2FA code invalid."};
      
      await this.auth2fa_svc.turnOn2FA(user.id);

      // return if 2FA activated?
      return {
		two_factor_enabled: true,
      }
    }

    // receive 2FA code to check if its correct, if it is correct logs user in. if fails return error.
    // clear the jwt 2fa cookie after this, if it works. what if it doesnt, clear or try again?
    @UseGuards(JwtAuth2FAGuard)
    @Post('2FA/login')
	async login2FA(
		@Body() twoFACode: twoFAPayload, // create dto of dis shit
		@Req() request: Request,
        @AuthUser() user: User,
        @Res() res: Response
	)//: Promise<LoginResponseType> {
        {
		const isCodeValid =
			this.auth2fa_svc.is2FACodeValid(
				twoFACode.code,
				user,
			);

        // if this fails 401 error, wrong 2FA code, for now erases cookie so user needs to log in again.
		if (!isCodeValid) {
            // request.res.clearCookie("isSecondFactorAuthenticated", {maxAge: 0,
            //     sameSite: 'strict',
            //     httpOnly: true,
            //     path: '/',
            // });
            return {error: "2FA code invalid."};
			//throw new UnauthorizedException('Wrong authentication code');
		}

        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh_token = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

		this.auth_svc.refresh(user, refresh_token);

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

        res.redirect('http://127.0.0.1:3000/');

        // logged in
		return {
			two_factor_enabled: user.is2FActive,
		};
	}
    
    @UseGuards(OAuthGuard)
    @Get("login") // login // remember to change this in .env too!
    async login(@AuthUser() user: User, @Req() request: Request, @Res() res: Response)//: Promise<any> {
    {
        // if 2FA activated return obj to frontend to display 2FA to user, else set cookies with jwt (if logged in) and return to frontend obj two_factor_enabled: false.
        if (user.is2FActive === true) // use boolean in db instead of string?
        {
            const twoFA_token = this.cookies_svc.get2FAJwtTokenCookie(user,);
            request.res.cookie("isSecondFactorAuthenticated", twoFA_token, {maxAge: 300 * 1000, // maxAge .env
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
            });

            res.redirect('http://127.0.0.1:3000/login/2fa');
            //return to 127.0.0.1:3000/login/2fa

            //return to 127.0.0.1:3000/

            // here add jwt cookie that tells the server that user tried to log in, make it available for 5 mins after that guard in /2fa/login will return 401.
            return { // maybe like i add a cookie with id here its not necessary to return to the frontend the id of the user.
				user_id: user.id,
				two_factor_enabled: true,
			};
        }

        // if cookies are already there verify if they are valid and dont log in, just return object to frontend
        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh_token = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

        // here call function that will update the status in our db to online, and update the refresh_token for the token
		this.auth_svc.refresh(user, refresh_token);

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

        // return if 2FA or if logged to front end here! with a json obj

        res.redirect('http://127.0.0.1:3000/');

        return {
			two_factor_enabled: false,
		};
    }

    @UseGuards(JwtAuthGuard)
    @Get("logged")
    async logged(@AuthUser() user: User, @Req() request: Request): Promise<any> {
        console.log(user);
        this.auth_svc.test_users(user);
        //console.log(request.headers, request.headers.cookie);
        return user;
    }

    // change return type & add async
    @UseGuards(JwtRefreshGuard)
    @Get("refresh")
    async refresh(@AuthUser() user: User, @Req() request: Request)//: Promise<any> {
    {
        const auth_token = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);

        // auth cookie refreshed for 24 hrs
        request.res.cookie('Authentication', auth_token, {maxAge: 86400 * 1000, // in ms // maxAge use JWT_AUTH_LIFETIME of env * 1000
        sameSite: 'strict',
        httpOnly: true,
        path: '/',
        });

        return "refresh token working!";
    }

    // change return type
    //if i logout here but have cookies stored they will work still, what to do about it? check with session of evaluators copyng same cookie after log out, for they it works too... weird.
    @UseGuards(JwtAuthGuard)
    @Get("logout")
    async logout(@AuthUser() user: User, @Req() request: Request)//: Promise<any> {
    {
        // here call function that will update the status in our db to offline, and update the refresh_token for the token (this case token null)
		this.auth_svc.refresh(user, null);

        // just clear cookies
        // maybe second parameter not needed.
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