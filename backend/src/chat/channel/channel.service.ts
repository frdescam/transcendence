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
      data.password = (data.password)
        ? await argon2.hash(data.password)
        : null;
      let val;
      if (data.password)
        val = {
          owner: data.owner,
          name: data.name,
          type: data.type,
          password: data.password,
          users: data.users,
          admins: data.admins
        };
      else
        val = {
          owner: data.owner,
          name: data.name,
          type: data.type,
          users: data.users,
          admins: data.admins
        };
      
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
    } catch (___) {
      return {
        message: 'Channel don\'t created',
        data: undefined,
        created: false,
      };
    }
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
