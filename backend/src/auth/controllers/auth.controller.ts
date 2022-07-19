import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common"; // post will be needed later, erase RES
import { Request, Response } from 'express';
import { ConfigService } from "@nestjs/config";

import { WsJwtGuard } from "../guards/ws-jwt.guard"; // erase WS strategy not needed here
import { JwtAuthGuard } from "../guards/auth-jwt.guard";
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

@Controller() //api heres // for now its in the index if not logged // change to auth someday
export class AuthController {
        constructor(private auth_svc: AuthService, private auth2fa_svc: TwoFactorAuthService, private config: ConfigService, private readonly cookies_svc: CookiesService,) { } // config useless

    //@UseGuards(WsJwtGuard)
    @Get("")
    index() {
        // if already logged re send to logged?
        // could check cookies and see if already logged just send to index directly.
        return "<a href='http://127.0.0.1:8080/test'><button>Log in!</button></a>"; // change to 8080
    }

    // all of 2fa needs its own controller most likely.
    // this shoudlnt return null? cant fail so could be.
    @UseGuards(JwtAuthGuard)
	@Get('2FA/deactivate2FA')
	async deactivate2FA(@AuthUser() user: User): Promise<void> {
		await this.auth2fa_svc.turnOff2FA(
			user.id,
		);
	}

    // user clicks on activate 2fa gets here.
    // after calling generate we could add a confirmation asking to add the 2FA code and checking if it worked, if it did update 2faActive = true in db, else throw error('Wrong authentication code') and make the user try again
    // if 2FA already active maybe ignore?
    @UseGuards(JwtAuthGuard)
    @Get('2FA/generate')
    async generate(@Res() response: Response, @AuthUser() user: User) {
      const otpauthUrl = await this.auth2fa_svc.generate2FASecret(user);
      console.log(otpauthUrl);
   
      return this.auth2fa_svc.pipeQrCodeStream(response, otpauthUrl);
    }

    // receive 2FA code first time to check if its correct, if it is correct updates user db (activates 2FA). if fails return error.
    // if this works should log out user?
    @UseGuards(JwtAuthGuard)
    @Post('2FA/turn-on')
    async turnOnTwoFactorAuthentication(
        @AuthUser() user: User,
        @Body() { twoFactorAuthenticationCode }// : TwoFactorAuthenticationCodeDto // create 2FA dto && add return that 2FA is activated
    ) {

    console.log(user.is2FActive, user.secretOf2FA);

        //if (user.is2FActive === false)
        //    return {two_factor_enabled: false};

      const isCodeValid = this.auth2fa_svc.is2FACodeValid(
        twoFactorAuthenticationCode,
        user,
      );

    console.log(isCodeValid);
      // if code sent failed 
      if (!isCodeValid)
        return {two_factor_enabled: false};
        //throw new UnauthorizedException('Wrong authentication code');
      
      await this.auth2fa_svc.turnOn2FA(user.id);

      // return if 2FA activated?
      return {
		two_factor_enabled: true,
      }
    }

    // receive 2FA code to check if its correct, if it is correct logs user in. if fails return error.
    @UseGuards(OAuthGuard)
    @Post('login2FA')
	async login2FA(
		@Body() { twoFactorAuthenticationCode }, // create dto of dis shit
		@Req() request: Request,
	)//: Promise<LoginResponseType> {
        {
		const user: User = await this.auth_svc.login({
			id: twoFactorAuthenticationCode.user_id,
		});
		if (!user) {
            // if this fails 401 error, wrong user?
			//throw new NotFoundException('User Not found');
		}
		const isCodeValid =
			this.auth2fa_svc.is2FACodeValid(
				twoFactorAuthenticationCode,
				user,
			);
		if (!isCodeValid) {
            // if this fails 401 error, wrong 2FA code
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

		return {
			two_factor_enabled: user.is2FActive,
		};
	}
    
    // change route and func to login
    @UseGuards(OAuthGuard)
    @Get("test") // login
    async test(@AuthUser() user: User, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
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
            return {
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