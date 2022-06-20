import { MutedService } from './muted.service';
import { MutedDTO } from '../orm/muted.dto';
import { Body, Controller, Delete, Get, HttpStatus, Param, Put } from '@nestjs/common';

@Controller('chat/muted')
export class MutedController {
  constructor(private mutedService: MutedService) {}

  @Get(':channelId')
  async getAll(@Param('channelId') channedId: number) {
    return {
      statusCode: HttpStatus.OK,
      banned: await this.mutedService.getAll(channedId)
    };
  }

  @Get(':channelId/:userId')
  async get(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      banned: await this.mutedService.getOne(channelId, userId)
    };
  }

  @Get(':channelId/:userId/check')
  async isMuted(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      info: await this.mutedService.isMuted(channelId, userId)
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
      info: await this.mutedService.add(channelId, userId, time)
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
      info: await this.mutedService.remove(channelId, userId, time)
    };
  }

  @Put(':channelId/:userId/update')
  async update(
    @Param('channelId') channelId: number,
    @Param('userId') userId: number,
    @Body() data: MutedDTO
  ) {
    await this.mutedService.update(channelId, userId, data);
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
    const ret = await this.mutedService.delete(channelId, userId);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      ret,
    };
  }
}
