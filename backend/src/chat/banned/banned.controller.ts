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

  @Put('update')
  async update(
    @Body() data: BannedDTO
  ) {
    await this.bannedService.update(data);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Banned user is updated',
      data
    };
  }
  
  @Delete(':delete')
  async delete(
    @Body() data: BannedDTO
  ) {
    const ret = await this.bannedService.delete(data);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      ret,
    };
  }
}
