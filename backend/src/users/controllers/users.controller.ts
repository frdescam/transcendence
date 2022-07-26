import { BadRequestException, Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common"; // post will be needed later, erase RES
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

    // could save img as :id, like that we can replace img each time instead of having 1000+ of em.
    // receive only
    // 'image/png',
	// 'image/jpg',
	// 'image/jpeg'
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        //fieldName: 'file',
        storage: diskStorage({
            destination: './upload/avatars',
            filename: (req, file, callback) => {
                console.log(req.user);
                const dis = req.user['id'];
                callback(null, (dis).toString());
              },
          }),
        //dest: '/avatars',
        fileFilter: (request, file, callback) => {
          if (!file.mimetype.includes('image')) {
            return callback(new BadRequestException('Provide a valid image'), false);
          }
          //console.log(request.user);
          callback(null, true);
        },
        limits: {
          fileSize: Math.pow(1024, 2) // 1MB
        },
        
      }))
    async uploadFile(@AuthUser() user: User, @UploadedFile() file: Express.Multer.File) {
        console.log(file, file.filename, file.mimetype.includes('image'), path.parse(file.originalname).name.replace(/\s/g, ''));
        //await this.users_svc.setAvatar(file.filename, user.id);
        //console.log(user);
        return await this.users_svc.setAvatar(file.filename, user.id);
    }

    // how do i show the damn avatar
    @Get('show')
    show(@AuthUser() user: User) {
        const avatar = "<html><img src='./upload/avatars/" + user.avatar + "'></html>";
        return avatar;
    }

    @Get(':id') // add ParseIntPipe
	async findOne(@Param('id') id: number): Promise<User> {
		const target: User = await this.users_svc.findOne({
			id: id,
		});

		if (!target)
            //throw new BadRequestException('User not found.');
            throw new NotFoundException('User not found.');

		return target;
	}

}