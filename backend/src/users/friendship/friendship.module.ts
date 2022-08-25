import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Friend } from '../orm/friend.entity';
import { UsersModule } from '../main.module';

import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';

@Module({
  imports: [TypeOrmModule.forFeature([Friend]), forwardRef(() => UsersModule)], // maybe change
  controllers: [FriendshipController],
  providers: [FriendshipService],
})
export class FriendshipModule {}