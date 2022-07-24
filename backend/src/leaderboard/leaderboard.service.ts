import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/services/users.service';
import { leaderboardRowDto } from './leaderboardRow.dto';

@Injectable()
export class LeaderboardService {
    constructor(
        private userService: UsersService,
    ) {}

    async getRows(userId: number, friendsOnly: boolean, startRow: number, count: number, filter: string, sortBy: string, descending: string) {
        // TODO : handle friends only case
        let allUsersAsEntity: User[];
        if (friendsOnly)
            allUsersAsEntity = await this.userService.findAll();
        // else {
        //     allUsersAsEntity = await this.userService.findFriends(userId);
        //     allUsersAsEntity.push(await this.userService.findOne({id: userId}))
        // }
        allUsersAsEntity.sort((a: User, b: User) => {
            console.log('descending : ', descending);
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
