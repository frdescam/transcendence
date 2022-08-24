import { Controller, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Get, Post, Delete } from '@nestjs/common';
import { Body, Query, Param } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
// import { ParseIntPipe } from '@nestjs/common';
// import { ForbiddenException } from '@nestjs/common';
// import { NotFoundException } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { FriendshipService } from './friendship.service';
import { Friend } from '../orm/friend.entity';

interface friendDto {
	id?: number;
}


@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendshipController {
	constructor(
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
	) {}

	//validation pipes
	@Post()
	async create(
		@AuthUser() user: User,
		@Body() friendDto: friendDto,
	): Promise<Friend> {
		console.log(friendDto, friendDto['id']);
		const target: User = await this.userService.findOneComplete({
			id: friendDto.id,
		});

		console.log(target);

		if (!target)
			throw new NotFoundException('User not found.');

		if (user.id === target.id)
			throw new ForbiddenException('You can\'t add yourself.');

		const friendship: Friend = await this.friendshipService.findOneOr(
			user,
			target,
		);

		console.log('after friendship', friendship);

		if (!friendship)
			return this.friendshipService.add(user, target);

		console.log('after if friend', friendship);

		if (friendship.user.id === user.id)
			return this.friendshipService.sanitizeFriend(friendship);

		friendship.isPending = false;

		console.log('end', friendship);

		return this.friendshipService.update(friendship);
	}

	@Get('accepted')
	async findAllAccepted(
		@AuthUser() user: User,
	) {
		return this.friendshipService.findAllOrWithAccepted(user, false);
	}

	@Get('pending')
	async findAllPending(
		@AuthUser() user: User,
	) {
		return this.friendshipService.findAllOrWithAccepted(user, true);
	}

	//validation pipes
	// Franco i could add a json object here isntead of Param tell me what u want
	@Delete(':id')
	async remove(
		@AuthUser() user: User,
		@Param('id') id: number,
	): Promise<boolean> {
		const target: User = await this.userService.findOneComplete({
			id: id,
		});

		if (!target)
			throw new NotFoundException('User not found.');

		// if (user.id === target.id)
			// throw new ForbiddenException('You can not be friend with yourself.');

		return this.friendshipService.remove(user, target);
	}
}