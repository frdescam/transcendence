import { Controller, ForbiddenException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { Get, Post, Delete } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { IgnoreService } from './ignore.service';
import { Ignore } from '../orm/ignored.entity';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

class ignoreDto {
	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	id?: number;
}

@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true })) // if this is global then can erase
@Controller('ignore')
export class IgnoreController {
	constructor(
		private readonly ignoreService: IgnoreService,
		private readonly userService: UserService,
	) {}

	@Post()
	async create(
		@AuthUser() user: User,
		@Body() create_dto: ignoreDto,
	): Promise<Ignore> {
		const target: User = await this.userService.findOne({
			id: create_dto.id,
		});

		if (!target)
			throw new NotFoundException('User not found.');

		if (user.id === target.id)
			throw new ForbiddenException('You can not ignore yourself.');

		if (await this.ignoreService.alreadyIgnored(user, target) === true)
			throw new ForbiddenException('Already ignored');

		return await this.ignoreService.create(user, target);
	}

	@Get()
	async findAll(@AuthUser() user: User): Promise<Ignore[]> {
		return this.ignoreService.findAll(user);
	}

	@Delete('delete')
	async remove(
		@AuthUser() user: User,
		@Body() create_dto: ignoreDto,
	): Promise<boolean> {
		const target: User = await this.userService.findOne({
			id: create_dto.id,
		});

		if (!target)
			throw new NotFoundException('User not found.');

		return this.ignoreService.remove(user, target);
	}
}