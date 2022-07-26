import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'
import { Match } from './entities/match.entity';
import { PendingInvitation } from './entities/pendingInvitation.entity';
import { MutedUser } from './entities/mutedUser.entity';
import { BannedUser } from './entities/bannedUser.entity';
import { Message } from './entities/message.entity';
import { Channel } from './entities/channel.entity';
import { UsersService } from './services/users.service';

import { UsersController } from './controllers/users.controller';

// Typeorm ForFeature is good??????

@Module({
  imports: [TypeOrmModule.forFeature([User, Match, PendingInvitation, MutedUser, BannedUser, Message, Channel]),],
  controllers: [UsersController,],
  providers: [
		UsersService,
	],
  exports: [
		UsersService,
	],
})
export class UsersModule { }