import { Controller, Get, HttpCode, HttpStatus, Injectable, Query, Req, Response, UnauthorizedException, UseFilters, UseGuards } from "@nestjs/common";
import { request, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from "@nestjs/config";

import { AuthService } from "./auth.service";
import { CookiesService } from './services/cookies.service';
import { AuthUser } from "./decorators/auth-user.decorator";
import { User } from "src/users/entities/user.entity";


// decide what guard im using!
// 2:05:00 of nestjs video, use put guard in its own file
// put this into its own file LULz

/*
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
  } from '@nestjs/common';
  import { Response } from 'express';
import { TokenError } from "passport-oauth2";
  
  @Catch()
  export class ViewAuthFilter implements ExceptionFilter {
    catch(exception: [TokenError, UnauthorizedException], host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
  
      console.log("error");

      // send to index or to error page?
      response.redirect('/');
    }
}
*/

// OAuth guard
@Injectable()
export class OAuthGuard extends AuthGuard('login') { // change name of guard here
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
        {
         console.log("error: ", error, user);
         throw new UnauthorizedException('OAuth guard failed.');
            // send to index or to error page?
            //response.redirect('/');
        }
		return user;
	}
}
// *put this into its own file LULz

// jwt guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('auth-jwt') {
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
        {
            console.log("error: ", error, user);
            throw new UnauthorizedException('Invalid JWT Token.');
        }
		return user;
	}
}
// jwt refresh guard
@Injectable()
export class JwtRefreshGuard extends AuthGuard('auth-jwt-refresh') {
	handleRequest<User>(error: any, user: User): User {
		if (error || !user)
        {
            console.log("error: ", error, user);
			throw new UnauthorizedException('Invalid JWT (Refresh) Token.');
        }
		return user;
	}
}
// *put this into its own file LULz


// cant have mutiple ppl with same pseudo nick, nickname
// is authService needed now in constructor?
// add async to route and stuff

@Controller() // for now its in the index if not logged // change to auth someday
export class AuthController {
        constructor(private authService: AuthService, private config: ConfigService, private readonly cookies_svc: CookiesService,) { }

    // if already logged re send to logged?
    @Get("")
    index() {
        return "<a href='http://127.0.0.1:3000/test'><button>Log in!</button></a>";
    }

    // this useful now?
    @Get("auth")
    //@UseGuards(AuthGuard('login'))
    auth(@Req() req: Request) {
        console.log(req);
        //return this.authService.auth();
    }

    //@HttpCode(HttpStatus.UNAUTHORIZED)
    // stop using Requests -> use custom decorator + typeorm (vid 2:13:00).
    // TODO *** JwtAuthStrategy guard!!!
    @UseGuards(OAuthGuard)
    @Get("test")
    //@UseFilters(ViewAuthFilter)
    async test(@AuthUser() user: User, @Req() request: Request)//, @Res() res: Response)//: Promise<any> {
    {
        const auth = this.cookies_svc.getAuthJwtTokenCookie(
			user,
		);
		const refresh = this.cookies_svc.getRefreshJwtTokenCookie(
			user,
		);

        // here call function that will update the status in our db to online, and update the refresh_token for the token
		    //this.auth_svc.refresh(user, refresh.token);

        // if 2FA activated return obj to frontend to display 2FA to user, else set cookies with jwt (if logged in) and return to frontend obj two_factor_enabled: false.

        if (user.typeOf2FA !== "none") // use boolean in db instead of string?
        {
            return {
				user_id: user.id,
				two_factor_enabled: true,
			};
        }

        // Add cookies here if not 2FA
        request.res.set('Set-Cookie', [auth.cookie, refresh.cookie]);


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

    //@UseFilters(ViewAuthFilter)
    @UseGuards(JwtAuthGuard)
    @Get("logged")
    logged(@Req() request: Request)//: Promise<any> {
    {
        //console.log(request.cookies?.Authentication);
        console.log(request.cookies);

        // how to clear cookie poc
        request.res.clearCookie("HAHA", {maxAge: 0,
            sameSite: 'strict',
            httpOnly: true,
            path: '/',
        });

        return "really logged in with jwt!";
    }

    // change return type & add async
    @UseGuards(JwtAuthGuard)
    @Get("data") // change to logout
    logout(@Req() request: Request)//: Promise<any> {
    {
        // here call function that will update the status in our db to offline, and update the refresh_token for the token (this case token null)
		    //this.auth_svc.refresh(user, null);
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

    // change return type & add async
    @UseGuards(JwtRefreshGuard)
    @Get("refresh") // change to logout
    refresh(@Req() request: Request)//: Promise<any> {
    {
        // just clear cookies
        return "refresh token working!";
    }
}