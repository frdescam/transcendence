import { Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user/user.service';
import { leaderboardRowDto } from '../orm/leaderboardRow.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    private userService: UserService,
  ) {}

  async getRows(startRow, count, filter, sortBy, descending) {
    const allUsersAsEntity = await this.userService.findAll();
    if (sortBy)
    {
      /*
      Don't use nested ternary for lisibility
      const sortFn = sortBy === 'desc'
        ? (descending
          ? (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0)
          : (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
        )
        : (descending
          ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
          : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
        );
      */
      allUsersAsEntity.sort((a, b) =>
      {
        if (sortBy === 'desc')
        {
          if (a.pseudo > b.pseudo)
            return (descending) ? -1 : 1;
          if (a.pseudo < b.pseudo)
            return (descending) ? 1 : -1;
          return 0;
        }
        return (descending) ?
          parseFloat(b[sortBy]) - parseFloat(a[sortBy]) :
          parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
      });
    }

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
      allUsersAsDto = allUsersAsDto.slice(startRow, parseInt(startRow) + parseInt(count));
    return {
      totalRowsNumber,
      rows: allUsersAsDto
    };
  }
}
