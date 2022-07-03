import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { ChannelDTO } from '../orm/channel.dto';
import { Channel } from '../orm/channel.entity';
import { Message } from '../orm/message.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  getAll(): Promise<Channel[]> {
    return this.channelRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'user')
      .leftJoinAndSelect('channel.messages', 'message')
      .leftJoinAndSelect('channel.bannedUsers', 'banned')
      .leftJoinAndSelect('channel.mutedUsers', 'muted')
      .leftJoinAndSelect('channel.admins', 'channel_admins_user')
      .leftJoinAndSelect('channel.users', 'channel_users_user')
      .getMany();
  }

  getOne(id: number): Promise<Channel> {
    return this.channelRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'user')
      .leftJoinAndSelect('channel.messages', 'message')
      .leftJoinAndSelect('channel.bannedUsers', 'banned')
      .leftJoinAndSelect('channel.mutedUsers', 'muted')
      .leftJoinAndSelect('channel.admins', 'channel_admins_user')
      .leftJoinAndSelect('channel.users', 'channel_users_user')
      .where('channel.id = :id', { id: id })
      .getOne();
  }

  getAllNoMessages(): Promise<Channel[]> {
    return this.channelRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'user')
      .leftJoinAndSelect('channel.bannedUsers', 'banned')
      .leftJoinAndSelect('channel.mutedUsers', 'muted')
      .leftJoinAndSelect('channel.admins', 'channel_admins_user')
      .leftJoinAndSelect('channel.users', 'channel_users_user')
      .getMany();
  }

  getOneNoMessages(id: number): Promise<Channel> {
    return this.channelRepository.createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'user')
      .leftJoinAndSelect('channel.bannedUsers', 'banned')
      .leftJoinAndSelect('channel.mutedUsers', 'muted')
      .leftJoinAndSelect('channel.admins', 'channel_admins_user')
      .leftJoinAndSelect('channel.users', 'channel_users_user')
      .where('channel.id = :id', { id: id })
      .getOne();
  }

  async create(data: ChannelDTO) {
    try {
      const val = {
        owner: data.owner,
        name: data.name,
        type: data.type,
        users: data.users,
        admins: data.admins
      };
      if (data.password)
        val['password'] = data.password;
      const newChannel = await this.channelRepository.createQueryBuilder()
        .insert()
        .into(Channel)
        .values([ val ])
        .execute();
      return {
        message: 'Channel created',
        data: await this.getOne(newChannel.generatedMaps[0].id),
        created: true,
      };
    } catch (err) {
      console.log(err);
      return {
        message: 'Channel don\'t created',
        data: undefined,
        created: false,
      };
    }
  }

  async update(data: ChannelDTO) {
    try {
      const __ret = {
        owner: data.owner,
        name: data.name
      };
      if (data.password)
        __ret['password'] = data.password;
      console.log(await this.channelRepository.createQueryBuilder()
        .update(Channel)
        .set(__ret)
        .where('id = :id', { id: data.id })
        .execute());
      return {
        message: 'Channel updated',
        data: await this.getOne(data.id),
        timestamp: Date,
        updated: true,
      };
    } catch (___)
    {
      return {
        message: 'Channel don\'t updated',
        data: undefined,
        timestamp: Date,
        updated: false
      };
    }
  }

  async remove(data: ChannelDTO) {
    try {
      await this.channelRepository.createQueryBuilder()
        .delete()
        .from(Channel)
        .where('id = :id', { id: data.id })
        .execute();
      return {
        message: 'Channel deleted',
        id: data.id,
        timestamp: Date,
        deleted: true,
      };
    } catch (___)
    {
      return {
        message: 'Channel don\'t deleted',
        id: data.id,
        timestamp: Date,
        deleted: false,
      };
    }
  }
}
