import { BadRequestException, Body, Controller, Get, HttpStatus, NotFoundException, Param, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'; // post will be needed later, erase RES
import { Express, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { UserService } from 'src/users/user/user.service';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { User } from 'src/users/orm/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

// most likely useless.
import { join } from 'path';
import path = require('path')

// cant have mutiple ppl with same pseudo
// add async to route and stuff

@UseGuards(JwtAuthGuard)
@Controller('users/')
export class UsersController {
  constructor(private readonly users_svc: UserService,) { }

  @Get('me')
  async me(@AuthUser() user: User): Promise<User> {
    const sanitize_user: User = await this.users_svc.findOne({
      id: user.id,
    });

    if (!sanitize_user)
      throw new BadRequestException('User not found.');

    return sanitize_user;
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
          );
          return callback(err, false);
        }
        //console.log(request.user);
        //console.log(path.parse(file.originalname).ext);
        callback(null, true);
      },
      limits: {
        fileSize: 5242880 // 5MB 
      },
        
    }))
  async uploadFile(@AuthUser() user: User, @UploadedFile() file) {
    //console.log(file, file.filename, file.mimetype.includes('image'), path.parse(file.originalname).name.replace(/\s/g, ''));
    //await this.users_svc.setAvatar(file.filename, user.id);
    //console.log(user);
    return await this.users_svc.updateAvatar(file.filename, user.id);
  }

    // for testing erase later
    // test to show that we can send the avatar to the frontend
    //   @Get('show')
    //   display(@AuthUser() user: User, @Res() res: Response){
    //   console.log(user, user.avatar);
    //   res.sendFile(user.avatar, { /*headers: ,*/ root: './upload/avatars' })
    // }

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
      const sanitize_user: User = await this.users_svc.findOne({
        id: id,
      });

      if (!sanitize_user)
        throw new BadRequestException('User not found.');
        //return undefined;

      // console.log(target);
      return sanitize_user;
    }
}