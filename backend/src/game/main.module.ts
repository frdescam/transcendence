import { Module } from '@nestjs/common';

import { UserModule } from 'src/user/main.module';
import { PartyModule } from './party/party.module';

import { MainGateway } from './main.gateway';

@Module({
  imports: [
    UserModule,
    PartyModule
  ],
  providers: [
    MainGateway
  ]
})
export class GameModule {}
