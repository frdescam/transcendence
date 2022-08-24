import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Post,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  Patch,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from '../orm/user.dto';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer";
import { User } from '../orm/user.entity';
import { Response } from 'express';
// import { NotFoundError } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(private channelService: UserService) {}
  
  //#Leo's part
  @UseGuards(JwtAuthGuard)
  @Get('me')
	async me(@AuthUser() user: User): Promise<User> {
    const sanitized_user: User = await this.channelService.findOne({
      id: user.id,
    });

    if (!sanitized_user)
      throw new BadRequestException('User not found.');

		return sanitized_user;
	}

    @UseGuards(JwtAuthGuard)
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
          fileSize: 5242880 // 5MB 
        },
        
      }))
    async uploadFile(@AuthUser() user: User, @UploadedFile() file) {
        //console.log(file, file.filename, file.mimetype.includes('image'), path.parse(file.originalname).name.replace(/\s/g, ''));
        //await this.channelService.setAvatar(file.filename, user.id);
        //console.log(user);
        return await this.channelService.updateAvatar(file.filename, user.id);
    }

    // for testing erase later
    // test to show that we can send the avatar to the frontend
    // add validation pipe for strings
    @Get('avatar/:name')
    async display(@Param('name') name: string, @Res() res: Response){
    // const sanitized_user: User = await this.channelService.findOne({
    //     id: id,
    // });
    // if (!sanitized_user)
      // throw new NotFoundException('user doesn\'t exists'); 
    // console.log(id, sanitized_user);
    res.sendFile(name, { root: './upload/avatars/' })
  }

  @UseGuards(JwtAuthGuard)
    @Patch('updatePseudo')
    async updatePseudo(
      @AuthUser() user: User,
      @Body() { update_pseudo }, // updated pseudo here, use dto?
      //@Param('id', ParseIntPipe) id: number,
    ): Promise<User | object> { // this is ugly, return only one!
      return this.channelService.updatePseudo(update_pseudo, user.id,);
    }

  @UseGuards(JwtAuthGuard)
    @Get(':id') // add ParseIntPipe to validate id // is this useful?
	  async findOne(@Param('id') id: number): Promise<User> {
      const sanitized_user: User = await this.channelService.findOne({
        id: id,
      });

      if (!sanitized_user)
        throw new BadRequestException('User not found.');
        //return undefined;

      // console.log(target);
      return sanitized_user;
	  }
  
  
  //# end of Leo's part
  @Get('get/:id')
  async getChannel(@Param('id') id: number) {
    const channel = await this.channelService.getOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched',
      channel,
    };
  }
 
  @Post('create')
  async createChannel(@Body() data: UserDTO) {
    const add = await this.channelService.create(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created',
      add,
    };
  }

  @Put('update')
  async updateChannel(@Body() data: UserDTO) {
    await this.channelService.update(data);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User updated',
      data,
    };
  }

  @Delete('delete')
  async deleteChannel(@Body() data: UserDTO) {
    const ret = await this.channelService.delete(data);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      message: 'User deleted',
      ret,
    };
  }
}
