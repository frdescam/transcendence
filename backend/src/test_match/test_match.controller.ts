import { Body, Controller, Post } from '@nestjs/common';
import { MatchRegistrationDto } from './matchRegistration.dto';
import { TestMatchService } from './test_match.service';

@Controller('test-match')
export class TestMatchController {

    constructor (private testMatchService: TestMatchService) {}

    @Post('register')
    async register(@Body() matchDto: MatchRegistrationDto) {
        console.log("=== test-match controller Post(register) ===");
        console.log("incomming dto :");
        console.log(matchDto);
        this.testMatchService.register(matchDto);
        return "match registered!"
    }
}
