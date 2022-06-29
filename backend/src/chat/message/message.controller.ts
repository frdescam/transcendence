import { MessageService } from './message.service';
import { MessageDTO } from '../orm/message.dto';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';

@Controller('chat/message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get('get/:channelId')
  async getAll(@Param('channelId') id: number) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      channelId: id,
      messages: await this.messageService.getAll(id),
    };
  }

  @Get('get/:channelId/:messageId')
  async getOne(
    @Param('channelId') channelId: number,
    @Param('messageId') messageId: number
  ) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      channelId: channelId,
      messages: await this.messageService.getOne(channelId, messageId),
    };
  }

  @Get('get/:channelId/:offset/:limit')
  async getPages(
    @Param('channelId') channelId: number,
    @Param('offset') offset: number,
    @Param('limit') limit: number
  )
  {
    return {
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      offset,
      limit,
      messages: await this.messageService.getPages(channelId, offset, limit),
    };
  }

  @Post('add')
  async create(@Body() data: MessageDTO) {
    const add = await this.messageService.create(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Message created successfully',
      add,
    };
  }

  @Put('update')
  async update(@Body() data: MessageDTO) {
    const update = await this.update(data);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      update,
    };
  }

  @Delete('delete')
  async delete(@Body() data: MessageDTO) {
    const ret = await this.messageService.remove(data);
    return {
      statusCode: ret.deleted ? HttpStatus.OK : HttpStatus.FORBIDDEN,
      ret,
    };
  }
}
