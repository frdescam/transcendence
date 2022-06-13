import { Controller, Get, Query, Req, Res, UnauthorizedException, UseFilters, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from "@nestjs/config";

// put this into its own file LULz
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
      response.redirect('/');
    }
}
// *put this into its own file LULz

// stop using Requests.

@Controller() // for now its in the index if not logged
export class AuthController {
        constructor(private authService: AuthService, private config: ConfigService,) { }

    @Get("")
    index() {
        return "<a href='http://127.0.0.1:3000/test'><button>Log in!</button></a>";
    }

    // this useful now?
    @Get("auth")
    //@UseGuards(AuthGuard('login'))
    auth(@Req() req: Request) {
        console.log(req);
        return this.authService.auth();
    }

    @Get("test")
    @UseGuards(AuthGuard('login'))
    @UseFilters(ViewAuthFilter)
    test(@Query() req: Request, @Res() res: Response)//: Promise<any> {
    {
        //console.log("req");
        //return this.authService.test();

        // Use nestjs codes instead of 301
        res.redirect(301, "logged");


        return "logged in!"; // useless now
        //return req.user;
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

    @Get("fail")
    fail()
    {
        return "failed login :(";
    }
}