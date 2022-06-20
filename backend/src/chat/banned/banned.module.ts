import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Banned } from '../orm/banned.entity';
import { BannedController } from './banned.controller';
import { BannedService } from './banned.service';

@Module({
  imports: [TypeOrmModule.forFeature([Banned])],
  controllers: [BannedController],
  providers: [BannedService]
})
export class BannedModule {}
