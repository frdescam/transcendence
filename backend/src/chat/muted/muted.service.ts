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
    const data = await this.mutedRepository.createQueryBuilder('muted')
      .leftJoinAndSelect('muted.channel', 'channel')
      .leftJoinAndSelect('muted.user', 'user')
      .getMany();
    for (const el of data)
    {
      if (
        Number(el.channel.id) === Number(channelId)
        && Number(el.user.id) === Number(userId)
      )
        return el;
    }
    return null;
  }

  async getAll(channelId: number): Promise<Muted[]> {
    const ret = new Array<Muted>;
    const data = await this.mutedRepository.createQueryBuilder('muted')
      .leftJoinAndSelect('muted.channel', 'channel')
      .leftJoinAndSelect('muted.user', 'user')
      .getMany();
    for (const el of data)
    {
      if (Number(el.channel.id) === Number(channelId))
        ret.push(el);
    }
    return ret;
  }

  async isMuted(channelId: number, userId: number): Promise<unknown> {
    const muted = await this.getOne(channelId, userId);
    if (!muted)
      return {
        isMuted: false
      };
    const untilDate = new Date(muted.until);
    const currentDate = new Date();
    if (untilDate.getTime() <= currentDate.getTime()) {
      return {
        isDeleted: await this.delete(channelId, userId),
        isMuted: false
      };
    }
    return {
      isMuted: true,
      until: untilDate.getTime()
    };
  }

  async add(channelId: number, userId: number, milliseconds: number) {
    const user = await this.getOne(channelId, userId);
    const newDate = new Date(user.until);
    newDate.setDate(newDate.getTime() + milliseconds);
    user.until = newDate;
    await this.mutedRepository.update({ id: user.id }, user);
  }

  async remove(channelId: number, userId: number, milliseconds: number) {
    const user = await this.getOne(channelId, userId);
    const newDate = new Date(user.until);
    newDate.setDate(newDate.getTime() - milliseconds);
    user.until = newDate;
    await this.mutedRepository.update({ id: user.id }, user);
  }

  async update(channelId: number, userId: number, data: MutedDTO) {
    const tempId = data.id;
    delete data.id;
    const update = await this.getOne(channelId, userId);
    data.until = new Date(data.until);
    await this.mutedRepository.update({ id: tempId }, update);
  }

  async delete(channelId: number, userId: number) {
    const user = await this.getOne(channelId, userId);
    try {
      await this.mutedRepository.delete({ id: user.id });
      return {
        message: 'User is no longer muted',
        deleted: true,
        userId: user.id,
      };
    }
    catch (___) {
      return {
        message: 'An error has occurred, user is still muted',
        deleted: false,
        userId: user.id,
      };
    }
  }
}
