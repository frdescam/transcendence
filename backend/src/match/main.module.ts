import { Module } from '@nestjs/common';

import { _MatchModule } from './match/match.module';

@Module({
  imports: [_MatchModule],
  exports: [_MatchModule],
})
export class MatchModule {}
