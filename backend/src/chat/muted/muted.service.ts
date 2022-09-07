import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Muted } from '../orm/muted.entity';
import { MutedDTO } from '../orm/muted.dto';

@Injectable()
export class MutedService {
  constructor(
    @InjectRepository(Muted)
    private mutedRepository: Repository<Muted>,
  ) {}

  async getOne(channelId: number, userId: number): Promise<Muted> {
    return this.mutedRepository.findOne({
      relations: ['channel', 'user'],
      where: {
        channel: {
          id: channelId
        },
        user: {
          id: userId
        }
      }
    });
  }

  async getAll(channelId: number): Promise<Muted[]> {
    return this.mutedRepository.find({
      relations: ['channel', 'user'],
      where: {
        channel: {
          id: channelId
        }
      }
    });
  }

  async isMuted(channelId: number, userId: number) {
    const muted = await this.getOne(channelId, userId);
    if (!muted)
      return {
        isMuted: false
      };
    const untilDate = new Date(muted.until);
    const currentDate = new Date();
    if (untilDate.getTime() <= currentDate.getTime()) {
      return {
        isDeleted: await this.delete(muted),
        isMuted: false
      };
    }
    return {
      isMuted: true,
      until: untilDate.getTime()
    };
  }

  async set(data: MutedDTO) {
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
        const create = await this.mutedRepository.createQueryBuilder()
          .insert()
          .into(Muted)
          .values([
            {
              channel: data.channel,
              user: data.user,
              until: data.until
            }
          ])
          .execute();
        return {
          message: 'Muted user success',
          id: create.generatedMaps[0].id,
          user: data.user.id,
          channel: data.channel.id,
          set: true
        };
      }
      
    } catch (___) {
      return {
        message: 'Muted user failed',
        id: -1,
        user: -1,
        channel: -1,
        set: false
      };
    }
  }

  async update(data: MutedDTO) {
    try {
      const update = await this.mutedRepository.createQueryBuilder('muted')
        .update()
        .set({
          until: data.until
        })
        .where('muted.channel.id = :id', { id: data.channel.id })
        .where('muted.user.id = :id', { id: data.user.id })
        .execute();
      return {
        message: 'Muted user update success',
        id: update.generatedMaps[0].id,
        user: data.user.id,
        channel: data.channel.id,
        update: true
      };
    } catch (___) {
      return {
        message: 'Muted user update failed',
        id: -1,
        user: -1,
        channel: -1,
        update: false
      };
    }
  }

  async delete(data: MutedDTO) {
    try {
      await this.mutedRepository.createQueryBuilder('muted')
        .delete()
        .from(Muted)
        .where('muted.id = :id', { id: data.id })
        .execute();
      return {
        message: 'Muted user deleted',
        id: data.id,
        user: data.user.id,
        channel: data.channel.id,
        timestamp: Date,
        deleted: true,
      };
    } catch (___) {
      return {
        message: 'Muted user don\'t deleted',
        id: data.id,
        user: data.user.id,
        channel: data.channel.id,
        timestamp: Date,
        deleted: false,
      };
    }
  }
}
