import { Injectable } from '@nestjs/common';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { FriendshipService } from 'src/users/friendship/friendship.service';

@Injectable()
export class LeaderboardService {
  constructor(
    private userService: UserService,
    private FriendshipService: FriendshipService,
  ) {}

  async getRows(user: User, friendsOnly: string, startRow: number, count: number, filter: string) {
    let allUsers: User[];
    if (friendsOnly == 'true') {
        allUsers = await this.FriendshipService.getFriends(user.id);
        allUsers.push(await this.userService.findOne({id: user.id}));
    } else {
        allUsers = await this.userService.findAll();
    }

    allUsers.sort((a: User, b: User) => {
      return a.rank - b.rank;
    });

    if (filter)
      allUsers = allUsers.filter(row => row.pseudo.toLowerCase().includes(filter.toLowerCase()));

    const totalRowsNumber = allUsers.length;

    if (count === 0)
      allUsers = allUsers.slice(startRow, allUsers.length);
    else
      allUsers = allUsers.slice(startRow, parseInt(startRow.toString()) + parseInt(count.toString()));
    return {
      totalRowsNumber,
      rows: allUsers
    };
  }
}
