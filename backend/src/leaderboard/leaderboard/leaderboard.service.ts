import { Injectable } from '@nestjs/common';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { FriendshipService } from 'src/users/friendship/friendship.service';
import { leaderboardRowDto } from '../orm/leaderboardRow.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    private userService: UserService,
    private FriendshipService: FriendshipService,
  ) {}

  async getRows(userId: number, friendsOnly: string, startRow: number, count: number, filter: string) {
    let allUsersAsEntity: User[];
    if (friendsOnly === 'true') {
      allUsersAsEntity = await this.FriendshipService.getFriends(userId);
      allUsersAsEntity.push(await this.userService.findOne({id: userId}));
    } else {
      allUsersAsEntity = await this.userService.findAll();
    }
    allUsersAsEntity.sort((a: User, b: User) => {
      return a.rank - b.rank;
    });

    let allUsersAsDto = allUsersAsEntity.map((entity) => {
      const dto: leaderboardRowDto = {
        rank: entity.rank,
        avatar: entity.avatar,
        pseudo: entity.pseudo,
        ratio: entity.ratio,
        level: entity.xp
      };
      return dto;
    });

    if (filter)
      allUsersAsDto = allUsersAsDto.filter(row => row.pseudo.toLowerCase().includes(filter.toLowerCase()));

    const totalRowsNumber = allUsersAsDto.length;

    if (count === 0)
      allUsersAsDto = allUsersAsDto.slice(startRow, allUsersAsDto.length);
    else
      allUsersAsDto = allUsersAsDto.slice(startRow, parseInt(startRow.toString()) + parseInt(count.toString()));
    return {
      totalRowsNumber,
      rows: allUsersAsDto
    };
  }
}
