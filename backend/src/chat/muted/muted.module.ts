import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Muted } from '../orm/muted.entity';
import { MutedService } from './muted.service';

@Module({
  imports: [TypeOrmModule.forFeature([Muted])],
  providers: [MutedService],
  exports: [MutedService]
})
export class MutedModule {}
