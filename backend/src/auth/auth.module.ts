import { Module } from "@nestjs/common";
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { CookiesService } from './services/cookies.service';
import { TwoFactorAuthService } from './services/twoFactorAuth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";
import { FortyTwoStrategy } from "./strategies/auth.strategy";
import { JwtAuthStrategy } from './strategies/auth-jwt.strategy';
import { JwtRefreshStrategy } from './strategies/auth-jwt-refresh.strategy';
import { WsJwtStrategy } from './strategies/ws-jwt.strategy';

// some stuff of here should be in app.module instead

@Module({
    imports: [HttpModule, JwtModule.register({}), UsersModule, ],
    controllers: [AuthController,],
    providers: [AuthService, CookiesService, TwoFactorAuthService, FortyTwoStrategy, JwtAuthStrategy, JwtRefreshStrategy, WsJwtStrategy], // erase WS strategy not needed here
})
export class AuthModule { }
