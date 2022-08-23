import { Injectable } from '@nestjs/common';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { leaderboardRowDto } from '../orm/leaderboardRow.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    private userService: UserService,
  ) {}

  async getRows(userId: number, friendsOnly: string, startRow: number, count: number, filter: string, sortBy: string, descending: string) {
    let allUsersAsEntity: User[];
    if (friendsOnly == 'true') {
        allUsersAsEntity = await this.userService.getFriends(userId);
        allUsersAsEntity.push(await this.userService.findOne({id: userId}));
    } else {
        allUsersAsEntity = await this.userService.findAll();
    }
    allUsersAsEntity.sort((a: User, b: User) => {
        if (sortBy === 'ratio') {
            if (descending == 'true')
                return a.ratio - b.ratio;
            else
                return b.ratio - a.ratio;
        } else {
            if (descending == 'true')
                return a.xp - b.xp;
            else 
                return b.xp - a.xp;
        };
    });

    let allUsersAsDto = allUsersAsEntity.map((entity, index) => {
      const dto: leaderboardRowDto = {
        rank: index + 1,
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
