import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common"; // post will be needed later, erase RES
import { Request, Response } from 'express';
import { ConfigService } from "@nestjs/config";

import { WsJwtGuard } from "../guards/ws-jwt.guard"; // erase WS strategy not needed here
import { JwtAuthGuard } from "../guards/auth-jwt.guard";
import { JwtAuth2FAGuard } from "../guards/auth-jwt-2fa.guard";
import { JwtRefreshGuard } from "../guards/auth-jwt-refresh.guard";
import { OAuthGuard } from "../guards/auth.guard";
import { AuthService } from "../services/auth.service";
import { CookiesService } from '../services/cookies.service';
import { AuthUser } from "../decorators/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { TwoFactorAuthService } from '../services/twoFactorAuth.service';

// cant have mutiple ppl with same pseudo nick, nickname
// add async to route and stuff
// create 2FA code somewhere!

export interface twoFAPayload {
	code?: string;
	user_id?: number; // most likely useless
}

@Controller() //api heres // for now its in the index if not logged // change to auth someday
export class AuthController {
        constructor(private auth_svc: AuthService, private auth2fa_svc: TwoFactorAuthService, private readonly cookies_svc: CookiesService,) { }

    //@UseGuards(WsJwtGuard)
    @Get("")
    index() {
        // if already logged re send to logged?
        // could check cookies and see if already logged just send to index directly.
        // if cookies are already there verify if they are valid and dont log in, just return object to frontend
        return "<a href='http://127.0.0.1:8080/login'><button>Log in!</button></a>";
    }

    // call deactivate + generate.
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

    // if 2FA already active, ignore generate
    // using response is bad
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
    // if this works should log out user?
    // if secret is in db & turn on is in db then this shouldnt work, just at the start
    @UseGuards(JwtAuthGuard)
    @Post('2FA/turn-on')
    async turnOnTwoFactorAuthentication(
        @AuthUser() user: User,
        @Body() { twoFactorAuthenticationCode }// : TwoFactorAuthenticationCodeDto // create 2FA dto && add return that 2FA is activated
    ) {
    console.log(user.is2FActive, user.secretOf2FA);

    // if secret is in db & turn on is in db then this shouldnt work, just at the start
    if (user.is2FActive === true)
        return {two_factor_enabled: false};

      const isCodeValid = this.auth2fa_svc.is2FACodeValid(
        twoFactorAuthenticationCode,
        user,
      );

    console.log(isCodeValid);
      // if code sent failed 
      if (!isCodeValid)
        return {error: "2FA already active, on this account."};
        //throw new UnauthorizedException('Wrong authentication code');
      
      await this.auth2fa_svc.turnOn2FA(user.id);

      // return if 2FA activated?
      return {
		two_factor_enabled: true,
      }
    }
    

    // receive 2FA code to check if its correct, if it is correct logs user in. if fails return error.
    //@UseGuards(OAuthGuard) // what guard can i use??????? another jwt yaya
    // here add jwt cookie that tells the server that user tried to log in, make it available for 5 mins after that guard in /2fa/login will return 401.
    // clear the jwt 2fa cookie after this, if it works and if it doesnt.
    @UseGuards(JwtAuth2FAGuard)
    @Post('2FA/login')
	async login2FA(
		@Body() twoFACode: twoFAPayload, // create dto of dis shit
		@Req() request: Request,
        @AuthUser() user: User
	)//: Promise<LoginResponseType> {
        {
        //to look for a user now is useless as its done in the guard
		// const user: User = await this.auth_svc.login({
		// 	id: twoFACode.user_id,
		// });
		// if (!user) {
        //     // if this fails 401 error, wrong user?
		// 	//throw new NotFoundException('User Not found');
        //     return "yo";
		// }
        // to look for a user now is useless as its done in the guard
		const isCodeValid =
			this.auth2fa_svc.is2FACodeValid(
				twoFACode.code,
				user,
			);

        // if this fails 401 error, wrong 2FA code
		if (!isCodeValid) {
            return {two_factor_enabled: false};
			//throw new UnauthorizedException('Wrong authentication code');
		}

        const auth = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

		this.auth_svc.refresh(user, refresh.token);

		request.res.setHeader('Set-Cookie', [auth.cookie, refresh.cookie]); // use poc

        // logged in
		return {
			two_factor_enabled: user.is2FActive,
		};
	}
    
    // change route and func to login
    @UseGuards(OAuthGuard)
    @Get("login") // login // remember to change this in .env too!
    async login(@AuthUser() user: User, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
    {
        // add cookie type
        // if cookies are already there verify if they are valid and dont log in, just return object to frontend
        const auth = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

        // if 2FA activated return obj to frontend to display 2FA to user, else set cookies with jwt (if logged in) and return to frontend obj two_factor_enabled: false.
        if (user.is2FActive === true) // use boolean in db instead of string?
        {
            const twoFA = this.cookies_svc.get2FAJwtTokenCookie(user,);
            request.res.set('Set-Cookie', [twoFA.cookie]); // erase dis, use poc

            // here add jwt cookie that tells the server that user tried to log in, make it available for 5 mins after that guard in /2fa/login will return 401.
            return { // maybe like i add a cookie with id here its not necessary to return to the frontend the id of the user.
				user_id: user.id,
				two_factor_enabled: true,
			};
        }

        // here call function that will update the status in our db to online, and update the refresh_token for the token
		this.auth_svc.refresh(user, refresh.token);

        // Add cookies here if not 2FA
        request.res.set('Set-Cookie', [auth.cookie, refresh.cookie]); // erase dis, use poc

        // poc of other way to add cookies, could erase funcs of cookies.service with this
        request.res.cookie("HAHA", auth.token, {maxAge: 86400 * 1000, // in ms // use env for maxAge
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        console.log(user);
        // return if 2FA or if logged to front end here! with a json obj
        return {
			two_factor_enabled: false,
		};
    }

    // this test useless can erase
    @UseGuards(JwtAuthGuard)
    @Get("logged")
    logged(@AuthUser() user: User, @Req() request: Request)//: Promise<any> {
    {
        console.log(user);
        //console.log(request.headers, request.headers.cookie);

        // how to clear cookie poc
        request.res.clearCookie("HAHA", {maxAge: 0,
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        return "really logged in with jwt!";
    }

    // change return type & add async
    @UseGuards(JwtRefreshGuard)
    @Get("refresh")
    refresh(@AuthUser() user: User, @Req() request: Request)//: Promise<any> {
    {
        const auth = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);

        // auth cookie refreshed for 24 hrs
        request.res.cookie('Authentication', auth.token, {maxAge: 86400 * 1000, // in ms // maxAge use JWT_AUTH_LIFETIME of env * 1000
        sameSite: 'strict',
        httpOnly: true,
        path: '/',
        });

        return "refresh token working!";
    }

    // change return type & add async
    //if i logout here but have cookies stored they will work still, what to do about it? check with session of evaluators copyng same cookie after log out, for they it works too... weird.
    @UseGuards(JwtAuthGuard)
    @Get("logout")
    logout(@AuthUser() user: User, @Req() request: Request)//: Promise<any> {
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