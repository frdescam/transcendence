import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Banned } from '../orm/banned.entity';
import { BannedDTO } from '../orm/banned.dto';

@Injectable()
export class BannedService {
  constructor(
    @InjectRepository(Banned)
    private bannedRepository: Repository<Banned>,
  ) {}

  async getOne(channelId: number, userId: number): Promise<Banned> {
    return this.bannedRepository.createQueryBuilder('banned')
      .where('banned.channel.id = :id', {id: channelId})
      .where('banned.user.id = :id', { id: userId })
      .leftJoinAndSelect('banned.channel', 'channel')
      .leftJoinAndSelect('banned.user', 'user')
      .getOne();
  }

  async getAll(channelId: number): Promise<Banned[]> {
    return this.bannedRepository.createQueryBuilder('banned')
      .where('banned.channel.id = :id', {id: channelId})
      .leftJoinAndSelect('banned.channel', 'channel')
      .leftJoinAndSelect('banned.user', 'user')
      .getMany();
  }

  async isBanned(channelId: number, userId: number) {
    const banned = await this.getOne(channelId, userId);
    if (!banned)
      return {
        user: undefined,
        isBanned: false,
        isDeleted: false
      };
    const untilDate = new Date(banned.until);
    const currentDate = new Date();
    if (untilDate.getTime() <= currentDate.getTime()) {
      return {
        user: await this.delete(banned),
        isBanned: false,
        isDeleted: true,
      };
    }
    return {
      user: banned,
      until: untilDate.getTime(),
      isBanned: true,
      isDeleted: false
    };
  }

  async set(data: BannedDTO)
  {
    try {
      if (await this.getOne(data.channel.id, data.user.id) !== undefined)
      {
        await this.update(data);
        return {
          message: 'Muted user success',
          user: data.user.id,
          channel: data.channel.id,
          set: true
        };
      }
      else
      {
        const create = await this.bannedRepository.createQueryBuilder()
          .insert()
          .into(Banned)
          .values([
            {
              channel: data.channel,
              user: data.user,
              until: data.until
            }
          ])
          .execute();
        return {
          message: 'Banned user success',
          id: create.generatedMaps[0].id,
          user: data.user.id,
          channel: data.channel.id,
          set: true
        };
      }
      
    } catch (___) {
      return {
        message: 'Banned user failed',
        id: -1,
        user: -1,
        channel: -1,
        set: false
      };
    }
  }

  async update(data: BannedDTO)
  {
    try {
      const update = await this.bannedRepository.createQueryBuilder('banned')
        .update()
        .set({
          until: data.until
        })
        .where('banned.channel.id = :id', { id: data.channel.id })
        .where('banned.user.id = :id', { id: data.user.id })
        .execute();
      return {
        message: 'Banned user update success',
        id: update.generatedMaps[0].id,
        user: data.user.id,
        channel: data.channel.id,
        update: true
      };
    } catch (___) {
      return {
        message: 'Banned user update failed',
        id: -1,
        user: -1,
        channel: -1,
        update: false
      };
    }
  }

  async delete(data: BannedDTO)
  {
    try {
      await this.bannedRepository.createQueryBuilder('banned')
        .delete()
        .from(Banned)
        .where('banned.id = :id', { id: data.id })
        .execute();
      return {
        message: 'Banned user deleted',
        id: data.id,
        user: data.user.id,
        channel: data.channel.id,
        timestamp: Date,
        deleted: true,
      };
    } catch (___) {
      return {
        message: 'Banned user don\'t deleted',
        id: data.id,
        user: data.user.id,
        channel: data.channel.id,
        timestamp: Date,
        deleted: false,
      };
    }
  }
}
