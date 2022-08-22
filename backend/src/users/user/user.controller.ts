import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from '../orm/user.dto';

@Controller('user')
export class UserController {
  constructor(private channelService: UserService) {}

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
