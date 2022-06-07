import { Module } from '@nestjs/common';
import { PartyService } from './party/party.service';
import { PartyController } from './party/party.controller';
import { GameGateway } from './game.gateway';

@Module({
  providers: [PartyService, GameGateway],
  controllers: [PartyController]
})
export class GameModule {}
