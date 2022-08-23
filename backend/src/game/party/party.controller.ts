import { Body, Request, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { userId } from 'src/common/game/types';
import { getPartyDto } from 'src/common/game/orm/getParty.dto';
import { CreatePartyDto } from '../orm/createParty.dto';
import { HTTPMockupAuthGuard } from 'src/usermockup/auth.guard';

@Controller('party')
export class PartyController
{
  constructor (private partyService: PartyService)
  {}
    
    @Get()
  findAll(): getPartyDto[]
  {
    return (this.partyService.getAllAsJSON());
  }

    @UseGuards(HTTPMockupAuthGuard)
    @Get('mine')
    findMine(
        @Request() req,
    ): string | null
    {
      const user: any = req.user;
      this.partyService.checkUserObject(user);
      const himself: userId = user.id;
      const party = this.partyService.findPartyWithUser(himself);

      return (party ? party.room : null);        
    }

    @UseGuards(HTTPMockupAuthGuard)
    @Put('giveup')
    giveup(
        @Request() req,
        @Param() params
    )
    {
      const user: any = req.user;
      this.partyService.checkUserObject(user);
      const himself: userId = user.id;
      const party = this.partyService.findPartyWithUser(himself);
      if (!party)
        return ({left: false});
      const slot = this.partyService.getSlotFromUser(party, himself);
      if (slot === -1)
        throw 'Unexpected state';
      if (params.room)
        if (params.room !== party.room)
          return ({left: false});

      if (this.partyService.admitDefeat(party, slot))
        return ({left: true});
      else
        return ({left: false});
    }

    @Get(':room')
    findOne(@Param() params): getPartyDto | null
    {
      const partyArr = this.partyService.getAll().filter(({room}) => (room === params.room));

      return (partyArr.length ? this.partyService.partyToPublicJson(partyArr[0]) : null);
    }
    
    @UseGuards(HTTPMockupAuthGuard)
    @Post()
    @UsePipes(new ValidationPipe({ transform: true, transformOptions: {enableImplicitConversion: true} }))
    create(
        @Body() {room = null, map = 'classic', adversary = null}: CreatePartyDto,
        @Request() req
    ): string
    {
      const user: any = req.user;
      this.partyService.checkUserObject(user);
      const himself: userId = user.id;

      // @TODO: check adversary ID existence
      const party = this.partyService.createParty(
        room,
        map,
        [himself, adversary]
      );
      return (party.room);
    }
}
