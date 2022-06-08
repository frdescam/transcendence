import { Controller, Get, Post, Req, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  create(@Req() request: Request): string {
    console.log(request.body);
    return 'This action adds a new cat';
  }

  @Get("test")
  //@Redirect('https://nestjs.com', 301)
  myname(@Req() request: Request): string {
    console.log(request);
    return 'test';
  }

  @Get()
  getHello(@Req() request: Request): string {
    console.log(request.body);
    return this.appService.getHello();
  }
}
