import { Module } from '@nestjs/common';
import { PartyService } from './party.service';
import { PartyController } from './party.controller';
import { UserModule } from 'src/user/main.module';
import { MatchModule } from 'src/match/main.module';

@Module({
  imports: [
    UserModule,
    MatchModule,
  ],
  controllers: [PartyController],
  providers: [PartyService],
  exports: [PartyService]
})
export class PartyModule {}