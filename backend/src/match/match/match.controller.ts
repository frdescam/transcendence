import { MatchService } from './match.service';
import { MatchDTO } from '../orm/match.dto';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';

@Controller('match')
export class MatchController {
  constructor(private matchService: MatchService) {}
  
  @Get(':matchId')
  async getOne(@Param('matchId') matchId: number) {
    return {
      statusCode: HttpStatus.OK,
      match: await this.matchService.getOne(matchId)
    };
  }

  @Get('user/:userId')
  async getAll(@Param('userId') userId: number) {
    return {
      statusCode: HttpStatus.OK,
      match: await this.matchService.getAll(userId)
    };
  }

  @Post('create')
  async create(@Body() data: MatchDTO) {
    const add = await this.matchService.create(data);
    return {
      statusCode: (add.created)
        ? HttpStatus.CREATED
        : HttpStatus.INTERNAL_SERVER_ERROR,
      add,
    };
  }

  @Put('update')
  async update(@Body() data: MatchDTO) {
    const up = await this.matchService.update(data);
    return {
      statusCode: (up.updated)
        ? HttpStatus.OK
        : HttpStatus.INTERNAL_SERVER_ERROR,
      up,
    };
  }

  @Delete('delete/:matchId')
  async delete(@Param('matchId') matchId: number) {
    const del = await this.matchService.delete(matchId);
    return {
      statusCode: (del.deleted)
        ? HttpStatus.OK
        : HttpStatus.INTERNAL_SERVER_ERROR,
      del,
    };
  }
}
