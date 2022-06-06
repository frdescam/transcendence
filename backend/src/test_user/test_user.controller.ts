import { Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { Console } from 'console';
import { TestUserService } from './test_user.service';
import { UserRegistrationDto } from '../userRegistration.dto';

@Controller('test-user')
export class TestUserController {
    constructor (private testUserService: TestUserService) {}
    
    @Post('register')
    async register(@Body() registerDto: UserRegistrationDto) {
        console.log("=== test-user controller Post(register) ===");
        console.log("incomming dto :");
        console.log(registerDto);
        this.testUserService.register(registerDto);
        return "you're now registered!";
    }
}
