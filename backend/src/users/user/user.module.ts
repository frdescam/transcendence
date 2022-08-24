import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../orm/user.entity';
import { Friend } from '../orm/friend.entity';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friend])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class _UserModule {}
