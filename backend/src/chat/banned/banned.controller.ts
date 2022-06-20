import { BannedService } from './banned.service';
import { BannedDTO } from '../orm/banned.dto';
import { Body, Controller, Delete, Get, HttpStatus, Param, Put } from '@nestjs/common';

@Controller('chat/banned')
export class BannedController {
  constructor(private bannedService: BannedService) {}

  @Get(':channelId')
  async getAll(@Param('channelId') channedId: number) {
    return {
      statusCode: HttpStatus.OK,
      banned: await this.bannedService.getAll(channedId)
    };
  }

  @Get(':channelId/:userId')
  async get(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      banned: await this.bannedService.getOne(channelId, userId)
    };
  }

  @Get(':channelId/:userId/check')
  async isBanned(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      info: await this.bannedService.isBanned(channelId, userId)
    };
  }

  @Get(':channelId/:userId/add/:time')
  async add(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
    @Param('time') time: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      info: await this.bannedService.add(channelId, userId, time)
    };
  }

  @Get(':channelId/:userId/remove/:time')
  async remove(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
    @Param('time') time: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      info: await this.bannedService.remove(channelId, userId, time)
    };
  }

  @Put(':channelId/:userId/update')
  async update(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
    @Body() data: BannedDTO
  ) {
    await this.bannedService.update(channelId, userId, data);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Banned user is updated',
      data
    };
  }
  
  @Delete(':channelId/:userId')
  async delete(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
  ) {
    const ret = await this.bannedService.delete(channelId, userId);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      ret,
    };
  }
}
