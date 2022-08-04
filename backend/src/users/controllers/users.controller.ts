import { BadRequestException, Body, Controller, Get, HttpStatus, NotFoundException, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"; // post will be needed later, erase RES
import { Express, Request, Response } from 'express';
import { ConfigService } from "@nestjs/config";

import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { UsersService } from "src/users/services/users.service";
import { AuthUser } from "src/auth/decorators/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

// most likely useless.
import { join } from 'path';
import path = require('path')

// cant have mutiple ppl with same pseudo
// add async to route and stuff

@UseGuards(JwtAuthGuard)
@Controller("users/")
export class UsersController {
        constructor(private readonly users_svc: UsersService,) { }

  @Get('me')
	async me(@AuthUser() user: User): Promise<User> {
		return user;
	}

    // if file is saved as :id and do we need to store the extension of teh file somewhere too? or can we just serve a file without telling the browser about it?
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        //fieldName: 'file',
        storage: diskStorage({
            destination: './upload/avatars',
            filename: (req, file, callback) => {
                //console.log(req.user);
                const id: number = req.user['id'];
                callback(null, (id).toString());
              },
          }),
        //dest: '/avatars',
        fileFilter: (request, file, callback) => {
          //if (!file.mimetype.includes('image')) {
          //  return callback(new BadRequestException('Provide a valid image'), false);
          //}
          const lower_originalname : string = file.originalname.toLowerCase();
          if (!lower_originalname.match(/\.(jpg|jpeg|png)$/)) { // gifs too?
            const err: BadRequestException = new BadRequestException(
              'Only image files (jpg|jpeg|png) are supported',
            )
            return callback(err, false)
          }
          //console.log(request.user);
          //console.log(path.parse(file.originalname).ext);
          callback(null, true);
        },
        limits: {
          fileSize: Math.pow(1024, 2) // 1MB more dan 1 mb?
        },
        
      }))
    async uploadFile(@AuthUser() user: User, @UploadedFile() file: Express.Multer.File) {
        //console.log(file, file.filename, file.mimetype.includes('image'), path.parse(file.originalname).name.replace(/\s/g, ''));
        //await this.users_svc.setAvatar(file.filename, user.id);
        //console.log(user);
        return await this.users_svc.updateAvatar(file.filename, user.id);
    }

    // for testing erase later
    // test to show that we can send the avatar to the frontend
    @Get('show')
    display(@Res() res){
    res.sendFile('1',{ root: './upload/avatars' })
  }

    @Patch('updatePseudo')
    async updatePseudo(
      @AuthUser() user: User,
      @Body() { update_pseudo }, // updated pseudo here, use dto?
      //@Param('id', ParseIntPipe) id: number,
    ): Promise<User | object> { // this is ugly, return only one!
      return this.users_svc.updatePseudo(update_pseudo, user.id,);
    }

    @Get(':id') // add ParseIntPipe to validate id
	  async findOne(@Param('id') id: number): Promise<User> {
      const target: User = await this.users_svc.findOne({
        id: id,
      });

      if (!target)
              throw new BadRequestException('User not found.');
              //throw new NotFoundException('User not found.');
              //return undefined;

      return target;
	  }
}