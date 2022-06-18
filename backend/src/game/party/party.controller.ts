import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PartyService } from './party.service';
import { userId } from 'src/common/game/logic/common';
import { Party, partyStatus } from './interfaces/party.interface';
import { CreatePartyDto } from './createParty.dto';
import { getPartyDto } from './getParty.dto';

@Controller('party')
export class PartyController
{
    constructor (private partyService: PartyService)
    {}

    private statusToString (status: partyStatus): string
    {
        switch (status) {
            case partyStatus.AwaitingPlayer:
                return "awaiting-player";
            case partyStatus.Warmup:
                return "warmup";
            case partyStatus.Paused:
                return "paused";
            case partyStatus.IntroducingSleeve:
                return "introducing-sleeve";
            case partyStatus.Running:
                return "running";
            case partyStatus.Finish:
                "finish"
                break;
                    
            default:
                return "unknown";
        }
    }

    private partyToPublicJson (party: Party): getPartyDto
    {
        const {room, map, status, playersId, state: {avatars, scores}} = party;

        return ({
            room,
            map,
            status: this.statusToString(status),
            players: playersId,
            avatars,
            scores
        });
    }
    
    @Get()
    findAll(): getPartyDto[]
    {
        return (this.partyService.getAll().map(this.partyToPublicJson.bind(this)));
    }

    @Get('mine')
    findMine(@Param() params): string | null
    {
        const himself: userId = 1;
        const party = this.partyService.findPartyWithUser(himself);

        return (party ? party.room : null);        
    }

    @Get(':room')
    findOne(@Param() params): getPartyDto | null
    {
        const partyArr = this.partyService.getAll().filter(({room}) => (room == params.room));

        return (partyArr.length ? this.partyToPublicJson(partyArr[0]) : null);
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, transformOptions: {enableImplicitConversion: true} }))
    create(@Body() {room, map = "classic", adversary = null}: CreatePartyDto): string
    {
        const himself: userId = 1;

        if (typeof room == "undefined")
            room = nanoid();
        
        // @TODO: check adversary ID existence
        const party = this.partyService.createParty(
            room,
            map,
            [himself, adversary]
        );
        return (party.room);

    }

    // @TODO: Allow to give up / leave party from REST
}
