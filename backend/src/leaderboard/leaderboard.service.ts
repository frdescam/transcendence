import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { leaderboardRowDto } from './leaderboardRow.dto';

@Injectable()
export class LeaderboardService {
    constructor(
        private userService: UsersService,
    ) {}

    async getRows(userId: number, friendsOnly: boolean, startRow: number, count: number, filter: string, sortBy: string, descending: boolean) {
        // TODO : handle friends only case
        let allUsersAsEntity = await this.userService.findAll();
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
                avatar: entity.avatar,
                pseudo: entity.pseudo,
                ratio: entity.ratio,
                level: entity.xp
            }
            return dto;
        });

        if (filter)
            allUsersAsDto = allUsersAsDto.filter(row => row.pseudo.toLowerCase().includes(filter.toLowerCase()))

        const totalRowsNumber = allUsersAsDto.length;

        if (count == 0) {
            allUsersAsDto = allUsersAsDto.slice(startRow, allUsersAsDto.length);
        } else {
            allUsersAsDto = allUsersAsDto.slice(startRow, startRow + count);
        }
        return {
            totalRowsNumber,
            rows: allUsersAsDto
        }
    }
}
