import { Module } from '@nestjs/common';
import { User } from 'src/user.entity';
import { Match } from 'src/match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyService } from './party/party.service';
import { PartyController } from './party/party.controller';
import { GameGateway } from './game.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Match])
  ],
  providers: [PartyService, GameGateway],
  controllers: [PartyController]
})
export class GameModule {}
