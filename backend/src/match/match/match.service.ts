import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Match } from '../orm/match.entity';
import { MatchDTO } from '../orm/match.dto';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async getOne(matchId: number): Promise<Match> {
    return this.matchRepository.createQueryBuilder('match')
      .leftJoinAndSelect('match.userHome', 'user')
      .leftJoinAndSelect('match.userForeign', 'user')
      .where('match.id = :id', { id: matchId })
      .getOne();
  }

  async getAll(userId: number): Promise<Match[]> {
    const ret = new Array<Match>;
    const data = await this.matchRepository.createQueryBuilder('match')
      .leftJoinAndSelect('match.userHome', 'user')
      .leftJoinAndSelect('match.userForeign', 'user')
      .getMany();
    for (const el of data)
    {
      if (el.userHome.id === Number(userId))
        ret.push(el);
    }
    return ret;
  }

  async create(data: MatchDTO) {
    try {
      const match = this.matchRepository.create(data);
      await this.matchRepository.save(match);
      return {
        message: `Match ${data.id} is created`,
        match,
        created: true
      };
    } catch (___) {
      return {
        message: 'Match don\'t created',
        created: false
      };
    }
  }

  async update(data: MatchDTO) {
    const tempId = data.id;
    delete data.id;
    try {
      const update = await this.getOne(tempId);
      await this.matchRepository.update({ id: tempId }, update);
      return {
        message: `Match ${tempId} updated`,
        updated: true
      };
    } catch (___) {
      return {
        message: 'Match don\'t exist',
        updated: false
      };
    }
    
  }

  async delete(matchId: number) {
    try {
      await this.matchRepository.delete({ id: matchId });
      return {
        message: `Match ${matchId} deleted`,
        deleted: true
      };
    } catch (___) {
      return {
        message: 'Match don\'t exist',
        deleted: false
      };
    }
  }
}
