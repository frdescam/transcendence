import { Module } from "@nestjs/common";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from "./auth.strategy";
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from "@nestjs/jwt";

// some stuff of here should be in app.module instead

@Module({
    imports: [HttpModule, JwtModule.register({})],
    controllers: [AuthController,],
    providers: [AuthService, FortyTwoStrategy,],
})
export class AuthModule { }
