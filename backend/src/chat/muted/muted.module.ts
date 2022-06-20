import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Muted } from '../orm/muted.entity';
import { MutedController } from './muted.controller';
import { MutedService } from './muted.service';

@Module({
  imports: [TypeOrmModule.forFeature([Muted])],
  controllers: [MutedController],
  providers: [MutedService]
})
export class MutedModule {}
