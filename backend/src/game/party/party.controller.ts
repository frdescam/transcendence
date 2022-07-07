import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { PartyService } from './party.service';
import { userId } from 'src/common/game/logic/common';
import { getPartyDto } from 'src/common/game/logic/getParty.dto';
import { CreatePartyDto } from './createParty.dto';

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
    findMine(@Param() params): string | null
    {
        const himself: userId = 1;
        const party = this.partyService.findPartyWithUser(himself);

        return (party ? party.room : null);        
    }

    @Put('giveup')
    giveup()
    {
        const himself: userId = 1;
        const party = this.partyService.findPartyWithUser(himself);
        if (!party)
            return null;
        const slot = this.partyService.getSlotFromUser(party, himself);
        if (slot == -1)
            return ;

        this.partyService.admitDefeat(party, slot);
    }

    @Get(':room')
    findOne(@Param() params): getPartyDto | null
    {
        const partyArr = this.partyService.getAll().filter(({room}) => (room == params.room));

        return (partyArr.length ? this.partyService.partyToPublicJson(partyArr[0]) : null);
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, transformOptions: {enableImplicitConversion: true} }))
    create(@Body() {room = null, map = "classic", adversary = null}: CreatePartyDto): string
    {
        const himself: userId = 1;

        // @TODO: check adversary ID existence
        const party = this.partyService.createParty(
            room,
            map,
            [himself, adversary]
        );
        return (party.room);
    }
}
