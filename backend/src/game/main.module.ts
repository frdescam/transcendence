import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/main.module';
import { PartyModule } from './party/party.module';

import { MainGateway } from './main.gateway';

@Module({
  imports: [
    UsersModule,
    PartyModule
  ],
  providers: [
    MainGateway
  ]
})
export class GameModule {}
