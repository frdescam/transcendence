import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { ChannelDTO } from '../orm/channel.dto';
import { Channel } from '../orm/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  getAll(): Promise<Channel[]> {
    return this.channelRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.messages', 'message')
      .leftJoinAndSelect('channel.bannedUsers', 'banned')
      .leftJoinAndSelect('channel.mutedUsers', 'muted')
      .leftJoinAndSelect('channel.admins', 'channel_admins_user')
      .leftJoinAndSelect('channel.users', 'channel_users_user')
      .getMany();
  }

  getOne(id: number): Promise<Channel> {
    return this.channelRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.messages', 'message')
      .leftJoinAndSelect('channel.bannedUsers', 'banned')
      .leftJoinAndSelect('channel.mutedUsers', 'muted')
      .leftJoinAndSelect('channel.admins', 'channel_admins_user')
      .leftJoinAndSelect('channel.users', 'channel_users_user')
      .where('channel.id = :id', { id: id })
      .getOne();
  }

  async create(data: ChannelDTO) {
    const channel = this.channelRepository.create(data);
    channel.password = (data.password)
      ? await argon2.hash(channel.password)
      : 'undefined';
    await this.channelRepository.save(channel);
    return channel;
  }

  async update(data: ChannelDTO) {
    const tempId = data.id;
    delete data.id;
    const update = await this.getOne(tempId);
    update.type = data.type;
    await this.channelRepository.update({ id: tempId }, update);
  }

  async remove(data: ChannelDTO) {
    const user = await this.getOne(data.id);
    try {
      if (user.password)
      {
        if (await argon2.verify(user.password, data.password)) {
          await this.channelRepository.delete({ id: data.id });
          return {
            message: 'Channel deleted',
            deleted: true,
          };
        }
      }
      else
      {
        await this.channelRepository.delete({ id: data.id });
        return {
          message: 'Channel deleted',
          deleted: true,
        };
      }
    }
    catch (___)
    {
      return {
        message: 'Password don\'t recognize',
        deleted: false,
      };
    }
  }
}
