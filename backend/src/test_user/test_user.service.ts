import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestMatchService } from 'src/test_match/test_match.service';
import { User } from 'src/user.entity';
import { Repository } from 'typeorm';
import { UserRegistrationDto } from '../userRegistration.dto';

@Injectable()
export class TestUserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async register(userData: UserRegistrationDto) {
        console.log("=== test-user service register method ===");
        const user = this.userRepo.create(userData);
        await this.userRepo.save(user);
        console.log("dto has been succesfully saved to the db")
        return user;
    }
}