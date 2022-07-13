import { Module } from "@nestjs/common";
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { CookiesService } from './services/cookies.service';
import { FortyTwoStrategy } from "./strategies/auth.strategy";
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { JwtAuthStrategy } from './strategies/auth-jwt.strategy';
import { JwtRefreshStrategy } from './strategies/auth-jwt-refresh.strategy';

// some stuff of here should be in app.module instead

@Module({
    imports: [HttpModule, JwtModule.register({}), UsersModule, ],
    controllers: [AuthController,],
    providers: [AuthService, FortyTwoStrategy, JwtAuthStrategy, JwtRefreshStrategy, CookiesService],
})
export class AuthModule { }
