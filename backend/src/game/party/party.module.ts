import { Module } from '@nestjs/common';
import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { UsersModule } from 'src/users/main.module';
import { MatchModule } from 'src/match/main.module';

@Module({
  imports: [
    UsersModule,
    MatchModule,
  ],
  controllers: [PartyController],
  providers: [PartyService],
  exports: [PartyService]
})
export class PartyModule {}