import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ignore } from '../orm/ignored.entity';
import { UsersModule } from '../main.module';

import { IgnoreController } from './ignore.controller';
import { IgnoreService } from './ignore.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ignore]), forwardRef(() => UsersModule)], // maybe change
  controllers: [IgnoreController],
  providers: [IgnoreService],
  exports: [IgnoreService],
})
export class IgnoreModule {}