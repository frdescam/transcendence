import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { Friend } from '../orm/friend.entity';
import { User } from '../orm/user.entity';

@Injectable({})
export class FriendshipService {
  constructor(
        @InjectRepository(Friend)
        private readonly frienships_repo: Repository<Friend>,
  ) {}

  async sanitizeFriend(friend: Friend): Promise<Friend>
  {
    if (friend) {
      if (friend.user) {
        const user: User = friend.user;
        delete user.fortytwo_id;
        delete user.refresh_token;
        delete user.secretOf2FA;
      }
      if (friend.followedUser) {
        const user: User = friend.followedUser;
        delete user.fortytwo_id;
        delete user.refresh_token;
        delete user.secretOf2FA;
      }
    }
    return friend;
  }

  async add(user: User, followedUser: User): Promise<Friend> {
    const Friend: Friend = this.frienships_repo.create();
    Friend.user = user;
    Friend.followedUser = followedUser;
    this.sanitizeFriend(Friend);
    return this.frienships_repo.save(Friend);
  }

  async getFriendsPendingOrAccepted(
    user: User,
    pending: boolean,
  ): Promise<User[]> {
    const friendRelations : Friend[] = (await this.frienships_repo.find({
      where: [
        { user: user, isPending: pending },
        { followedUser: user, isPending: pending },
      ],
    }));
    friendRelations.forEach(elem => this.sanitizeFriend(elem));
    const friends: User[] = [];
    friendRelations.forEach(friendRelation => {
      if (friendRelation.user.id === user.id)
        friends.push(friendRelation.followedUser);
      else
        friends.push(friendRelation.user);
    });
    return friends;
  }

  async findOneOr(user: User, followedUser: User): Promise<Friend> {
    return this.frienships_repo.findOne({
      where: [
        { user: user, followedUser: followedUser },
        { user: followedUser, followedUser: user },
      ],
    });
  }

  async update(Friend: Friend): Promise<Friend> {
    this.sanitizeFriend(Friend);
    return this.frienships_repo.save(Friend);
  }

  async remove(user: User, followedUser: User): Promise<boolean> {
    const result: DeleteResult = (
      await this.frienships_repo.delete({
        user: user,
        followedUser: followedUser,
      }));

    if (result.affected != 0)
      return true;
    else
      return false;
  }
}