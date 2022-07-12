import { Body, Request, Controller, Get, Param, Post, Put, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { userId } from 'src/common/game/logic/common';
import { getPartyDto } from 'src/common/game/logic/getParty.dto';
import { CreatePartyDto } from './createParty.dto';
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
    )
    {
        const user: any = req.user;
        this.partyService.checkUserObject(user);
        const himself: userId = user.id;
        const party = this.partyService.findPartyWithUser(himself);
        if (!party)
            return ({leaved: false});
        const slot = this.partyService.getSlotFromUser(party, himself);
        if (slot == -1)
            throw "Unexpected state";

        this.partyService.admitDefeat(party, slot);
        return ({leaved: true});
    }

    @Get(':room')
    findOne(@Param() params): getPartyDto | null
    {
        const partyArr = this.partyService.getAll().filter(({room}) => (room == params.room));

        return (partyArr.length ? this.partyService.partyToPublicJson(partyArr[0]) : null);
    }
    
    @UseGuards(HTTPMockupAuthGuard)
    @Post()
    @UsePipes(new ValidationPipe({ transform: true, transformOptions: {enableImplicitConversion: true} }))
    create(
        @Body() {room = null, map = "classic", adversary = null}: CreatePartyDto,
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
