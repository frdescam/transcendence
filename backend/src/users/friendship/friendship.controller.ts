import { Controller, ForbiddenException, InternalServerErrorException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { Get, Post, Delete } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/auth-jwt.guard';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { FriendshipService } from './friendship.service';
import { Friend } from '../orm/friend.entity';
import { idValidationDto } from '../orm/userValidation.dto';

@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller('friends')
export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async create(
    @AuthUser() user: User,
    @Body() friendDto: idValidationDto,
  ): Promise<Friend> {
    const target: User = await this.userService.findOneComplete({
      id: friendDto.id,
    });

    if (!target)
      throw new NotFoundException('User not found.');

    if (user.id === target.id)
      throw new ForbiddenException('You can\'t add yourself.');

    const friendship: Friend = await this.friendshipService.findOneOr(
      user,
      target,
    );

    if (!friendship)
      return this.friendshipService.add(user, target);

    if (friendship.user.id === user.id)
      return this.friendshipService.sanitizeFriend(friendship);

    friendship.isPending = false;

    return this.friendshipService.update(friendship);
  }

  @Get('accepted')
  async findAllAccepted(
    @AuthUser() user: User,
  ): Promise<User[]> {
    return this.friendshipService.getFriendsPendingOrAccepted(user, false);
  }

  @Get('pending')
  async findAllPending(
    @AuthUser() user: User,
  ): Promise<User[]> {
    return this.friendshipService.getFriendsPendingOrAccepted(user, true);
  }

  @Delete('delete')
  async remove(
    @AuthUser() user: User,
    @Body() friendDto: idValidationDto,
  ): Promise<boolean> {
    const target: User = await this.userService.findOneComplete({
      id: friendDto.id,
    });

    if (!target)
      throw new NotFoundException('User not found.');

    return this.friendshipService.remove(user, target);
  }

  @Post('status')
  async getFriendshipStatus(
    @AuthUser() user: User,
    @Body() { id }: idValidationDto
  ): Promise<{friend: boolean, asked: boolean, asking: boolean}>
  {
    try {
      let friend = false;
      let asked = false;
      let asking = false;

      const res =
        await this.friendshipService.findOneOr(
          user,
          await this.userService.getOne(id)
        );
      
      if (typeof res !== 'undefined')
      {
        const {isPending, user: requester} = res;
  
        friend = !isPending;
        asked = isPending && requester.id === user.id;
        asking = isPending && requester.id === id;
      }

      return ({
        friend,
        asked,
        asking
      });
    } catch (___)
    {
      throw new InternalServerErrorException('Database error');
    }
  }
}