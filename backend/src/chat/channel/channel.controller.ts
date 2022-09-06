import { ChannelService } from './channel.service';
import { ChannelDTO } from '../orm/channel.dto';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';

@Controller('chat/channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('get/no-messages')
  async getAllNoMessages() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Channels fetched successfully',
      channels: await this.channelService.getAllNoMessages(),
    };
  }

  @Get('get/no-messages/:id')
  async getOneNoMessages(@Param('id') id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Channel fetched successfully',
      channel: await this.channelService.getOneNoMessages(id),
    };
  }

  @Get('get')
  async getAll() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Channels fetched successfully',
      channels: await this.channelService.getAll(),
    };
  }

  @Get('get/:id')
  async getOne(@Param('id') id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Channel fetched successfully',
      channel: await this.channelService.getOne(id),
    };
  }

  @Post('create')
  async createChannel(@Body() data: ChannelDTO) {
    const add = await this.channelService.create(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Channel is created successfully',
      add,
    };
  }

  @Put('update')
  async updateChannel(@Body() data: ChannelDTO) {
    await this.channelService.update(data);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Channel update',
      data,
    };
  }

  @Delete('delete')
  async deleteChannel(@Body() data: ChannelDTO) {
    const ret = await this.channelService.remove(data);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      message: 'Channel deletion',
      ret,
    };
  }
}
