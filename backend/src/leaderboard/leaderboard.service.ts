import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { leaderboardRowDto } from './leaderboardRow.dto';

@Injectable()
export class LeaderboardService {
    constructor(
        private userService: UserService,
    ) {}

    async getRows(startRow, count, filter, sortBy, descending) {
        let allUsersAsEntity = await this.userService.getAll();

        if (sortBy)
        {
            const sortFn = sortBy === 'desc'
                ? (descending
                    ? (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0)
                    : (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
                )
                : (descending
                    ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
                    : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
                );
            allUsersAsEntity.sort(sortFn);
        }

        let allUsersAsDto = allUsersAsEntity.map((entity, index) => {
            let dto: leaderboardRowDto = {
                rank: index + 1,
                avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
                pseudo: entity.username,
                ratio: 0,
                level: 0.1
            }
            return dto;
        });

        if (filter)
            allUsersAsDto = allUsersAsDto.filter(row => row.pseudo.toLowerCase().includes(filter.toLowerCase()))

        const totalRowsNumber = allUsersAsDto.length;

        if (count == 0) {
            allUsersAsDto = allUsersAsDto.slice(startRow, allUsersAsDto.length);
        } else {
            allUsersAsDto = allUsersAsDto.slice(startRow, parseInt(startRow) + parseInt(count));
        }
        return {
            totalRowsNumber,
            rows: allUsersAsDto
        }
    }
}
