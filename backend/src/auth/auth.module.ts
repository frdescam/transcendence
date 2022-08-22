import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { CookiesService } from './services/cookies.service';
import { TwoFactorAuthService } from './services/twoFactorAuth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/main.module';
import { FortyTwoStrategy } from './strategies/auth.strategy';
import { JwtAuthStrategy } from './strategies/auth-jwt.strategy';
import { JwtRefreshStrategy } from './strategies/auth-jwt-refresh.strategy';
import { JwtAuth2FAStrategy } from './strategies/auth-jwt-2fa.strategy';
import { WsJwtStrategy } from './strategies/ws-jwt.strategy';


@Module({
  imports: [
    HttpModule,
    JwtModule.register({}),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CookiesService,
    TwoFactorAuthService,
    FortyTwoStrategy,
    JwtAuthStrategy,
    JwtRefreshStrategy,
    JwtAuth2FAStrategy,
    WsJwtStrategy
  ],
})
export class AuthModule { }
