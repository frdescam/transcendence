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
    const data = await this.bannedRepository.createQueryBuilder('banned')
      .leftJoinAndSelect('banned.channel', 'channel')
      .leftJoinAndSelect('banned.user', 'user')
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

  async getAll(channelId: number): Promise<Banned[]> {
    const ret = new Array<Banned>;
    const data = await this.bannedRepository.createQueryBuilder('banned')
      .leftJoinAndSelect('banned.channel', 'channel')
      .leftJoinAndSelect('banned.user', 'user')
      .getMany();
    for (const el of data)
    {
      if (Number(el.channel.id) === Number(channelId))
        ret.push(el);
    }
    return ret;
  }

  async isBanned(channelId: number, userId: number): Promise<unknown> {
    const banned = await this.getOne(channelId, userId);
    if (!banned)
      return {
        isBanned: false
      };
    const untilDate = new Date(banned.until);
    const currentDate = new Date();
    if (untilDate.getTime() <= currentDate.getTime()) {
      return {
        isDeleted: await this.delete(channelId, userId),
        isBanned: false
      };
    }
    return {
      isBanned: true,
      until: untilDate.getTime()
    };
  }

  async add(channelId: number, userId: number, milliseconds: number) {
    const user = await this.getOne(channelId, userId);
    const newDate = new Date(user.until);
    newDate.setDate(newDate.getTime() + milliseconds);
    user.until = newDate;
    await this.bannedRepository.update({ id: user.id }, user);
  }

  async remove(channelId: number, userId: number, milliseconds: number) {
    const user = await this.getOne(channelId, userId);
    const newDate = new Date(user.until);
    newDate.setDate(newDate.getTime() - milliseconds);
    user.until = newDate;
    await this.bannedRepository.update({ id: user.id }, user);
  }

  async update(channelId: number, userId: number, data: BannedDTO) {
    const tempId = data.id;
    delete data.id;
    const update = await this.getOne(channelId, userId);
    data.until = new Date(data.until);
    await this.bannedRepository.update({ id: tempId }, update);
  }

  async delete(channelId: number, userId: number) {
    const user = await this.getOne(channelId, userId);
    try {
      await this.bannedRepository.delete({ id: user.id });
      return {
        message: 'User is no longer banned',
        deleted: true,
        userId: user.id,
      };
    }
    catch (___) {
      return {
        message: 'An error has occurred, user is still banned',
        deleted: false,
        userId: user.id,
      };
    }
  }
}
