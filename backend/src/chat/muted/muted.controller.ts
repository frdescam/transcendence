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

  @Put('update')
  async update(
    @Body() data: MutedDTO
  ) {
    await this.mutedService.update(data);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Banned user is updated',
      data
    };
  }
  
  @Delete('delete')
  async delete(
    @Body() data: MutedDTO
  ) {
    const ret = await this.mutedService.delete(data);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      ret,
    };
  }
}
