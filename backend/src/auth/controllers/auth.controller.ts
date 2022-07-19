import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Request } from 'express';
import { ConfigService } from "@nestjs/config";

import { JwtAuthGuard } from "../guards/auth-jwt.guard";
import { JwtRefreshGuard } from "../guards/auth-jwt-refresh.guard";
import { OAuthGuard } from "../guards/auth.guard";
import { AuthService } from "../services/auth.service";
import { CookiesService } from '../services/cookies.service';
import { AuthUser } from "../decorators/auth-user.decorator";
import { User } from "src/users/entities/user.entity";

// cant have mutiple ppl with same pseudo nick, nickname
// add async to route and stuff

@Controller() // for now its in the index if not logged // change to auth someday
export class AuthController {
        constructor(private auth_svc: AuthService, private config: ConfigService, private readonly cookies_svc: CookiesService,) { }

    // if already logged re send to logged?
    @Get("")
    index() {
        return "<a href='http://127.0.0.1:8080/test'><button>Log in!</button></a>";
    }

    // change to route and func to login
    @UseGuards(OAuthGuard)
    @Get("test") // login
    async test(@AuthUser() user: User, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
    {
        const auth = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

        // here call function that will update the status in our db to online, and update the refresh_token for the token
		this.auth_svc.refresh(user, refresh.token);

        // if 2FA activated return obj to frontend to display 2FA to user, else set cookies with jwt (if logged in) and return to frontend obj two_factor_enabled: false.
        if (user.typeOf2FA !== "none") // use boolean in db instead of string?
        {
            return {
				user_id: user.id,
				two_factor_enabled: true,
			};
        }

        // Add cookies here if not 2FA
        request.res.set('Set-Cookie', [auth.cookie, refresh.cookie]); // erase dis, use poc


        // poc of other way to add cookies, could erase funcs of cookies.service with this
        request.res.cookie("HAHA", auth.token, {maxAge: 86400 * 1000, // in ms
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        // return if 2FA or if logged to front end here! with a json obj
        return {
			two_factor_enabled: false,
		};
        
    }

    // this test useless can erase
    @UseGuards(JwtAuthGuard)
    @Get("logged")
    logged(@Req() request: Request)//: Promise<any> {
    {
        //console.log(request.cookies);

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
    @Get("data") // change to logout
    logout(@AuthUser() user: User, @Req() request: Request)//: Promise<any> {
    {
        // here call function that will update the status in our db to offline, and update the refresh_token for the token (this case token null)
		this.auth_svc.refresh(user, null);

        // just clear cookies
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