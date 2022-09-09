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
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from '../orm/user.dto';
import { avatarValidationDto, updateUserValidationDto } from '../orm/userValidation.dto';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { User } from '../orm/user.entity';
import { Response } from 'express';
import { AchievementsDto } from '../orm/achievements.dto';

@Controller('user')
export class UserController {
  constructor(private channelService: UserService) {}
  
  @UseGuards(JwtAuthGuard)
  @Get('new')
  async new_user(@AuthUser() user: User): Promise<void> {
    this.channelService.setNewUser(user);
  }

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
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload/avatars',
        filename: (req, file, callback) => {
          const id: number = req.user['id'];
          callback(null, (id).toString());
        },
      }),
      fileFilter: (request, file, callback) => {
        const lower_originalname : string = file.originalname.toLowerCase();
        if (!lower_originalname.match(/\.(jpg|jpeg|png)$/)) { // gifs too?
          const err: BadRequestException = new BadRequestException(
            'Only image files (jpg|jpeg|png) are supported',
          );
          return callback(err, false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5242880
      },
    }))
  async uploadFile(@AuthUser() user: User, @UploadedFile() file) {
    return await this.channelService.updateAvatar(file.filename, user.id);
  }

    @Get('avatar/:pseudo')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async display(@Param() pseudo_dto: avatarValidationDto, @Res() res: Response) {
      res.sendFile(pseudo_dto.pseudo, { root: './upload/avatars/' });
    }

  @UseGuards(JwtAuthGuard)
    @Patch('updatePseudo')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async updatePseudo(
      @AuthUser() user: User,
      @Body() update_pseudo_dto : updateUserValidationDto,
    ) {
      return this.channelService.updatePseudo(update_pseudo_dto.update_pseudo, user.id,);
    }

    @UseGuards(JwtAuthGuard)
    @Get('match/get/:id')
    async getMatches(@Param('id', ParseIntPipe) id: number): Promise<User> {
      const sanitized_user: User = await this.channelService.getMatches(id);

      if (!sanitized_user)
        throw new BadRequestException('User not found.');

      return sanitized_user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('achievements/get/:id')
    async getAchievements(@Param('id', ParseIntPipe) id: number) : Promise<AchievementsDto[]> {
      return this.channelService.getAchievements(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
      const sanitized_user: User = await this.channelService.findOne({
        id: id,
      });

      if (!sanitized_user)
        throw new BadRequestException('User not found.');

      return sanitized_user;
    }

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
