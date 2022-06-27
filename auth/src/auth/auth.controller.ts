import { Controller, Get, HttpCode, HttpStatus, Injectable, Query, Req, Res, UnauthorizedException, UseFilters, UseGuards } from "@nestjs/common";
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from "@nestjs/config";

import { AuthService } from "./auth.service";
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

@Injectable()
export class OAuthGuard extends AuthGuard('login') {
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

// 2:05:00 of nestjs video, use put guard in its own file
// cant have mutiple ppl with same pseudo nick, nickname?
// is authService needed now in constructor?

@Controller() // for now its in the index if not logged // change to auth someday
export class AuthController {
        constructor(private authService: AuthService, private config: ConfigService,) { }

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
    @UseGuards(OAuthGuard)
    @Get("test")
    //@UseFilters(ViewAuthFilter)
    async test(@AuthUser() user: User)//, @Res() res: Response)//: Promise<any> {
    {
        //console.log("req");
        //return this.authService.test();

        //console.log(`${user.pseudo}#${1}`);
        //console.log(`${user.avatar}#${user.id + 1}`);
        
        //console.log(user);
        
        // Use nestjs codes instead of 301
        // maybe instead of this i could call func and return stuff here?
        //res.redirect(301, "logged");

        return {user};
        return "logged in!";
    }

    // here we use jwt guard!
    @Get("logged")
    //@UseGuards(AuthGuard('login'))
    //@UseFilters(ViewAuthFilter)
    logged(@Query() req: Request)//: Promise<any> {
    {
        //console.log("req");
        //return this.authService.test();
        return "really logged in!";
        //return req.user;
    }

    @Get("fail") // is dis useless?
    fail()
    {
        return "failed login :(";
    }
}