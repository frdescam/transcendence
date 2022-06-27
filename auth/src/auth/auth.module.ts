import { Module } from "@nestjs/common";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from "./strategies/auth.strategy";
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "src/users/users.module";

// some stuff of here should be in app.module instead

@Module({
    imports: [HttpModule, JwtModule.register({}), UsersModule,],
    controllers: [AuthController,],
    providers: [AuthService, FortyTwoStrategy,],
})
export class AuthModule { }
