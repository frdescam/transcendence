import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from 'src/match.entity';
import { TestUserService } from 'src/test_user/test_user.service';
import { Repository } from 'typeorm';
import { MatchRegistrationDto } from './matchRegistration.dto';

@Injectable()
export class TestMatchService {
    constructor(
        @InjectRepository(Match)
        private matchRepo: Repository<Match>,
    ) {}

    async register (matchData: MatchRegistrationDto) {
        const match = this.matchRepo.create(matchData);
        console.log("=== test-match service register method ===");
        await this.matchRepo.save(match);
        console.log("dto has been succesfully saved to the db")
        return match;
    }
}
