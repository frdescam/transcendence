import { Module } from '@nestjs/common';
import { User } from 'src/user/orm/user.entity';
import { Match } from 'src/match/orm/match.entity';
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
