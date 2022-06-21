import { Module } from '@nestjs/common';

import { _MatchModule } from './match/match.module';

@Module({
  imports: [
    _MatchModule
  ],
})
export class MatchModule {}
