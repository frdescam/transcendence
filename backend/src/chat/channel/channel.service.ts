import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//import * as argon2 from 'argon2';

import { ChannelDTO } from '../orm/channel.dto';
import { Channel } from '../orm/channel.entity';
import { UserDTO } from 'src/user/orm/user.dto';
import { User } from 'src/user/orm/user.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>
  ) {}

  getAll(): Promise<Channel[]> {
    return this.channelRepository.find({
      relations: [
        'owner',
        'messages',
        'admins',
        'users',
        'bannedUsers', 'bannedUsers.user',
        'mutedUsers', 'mutedUsers.user'
      ]
    });
  }

  getOne(id: number): Promise<Channel> {
    return this.channelRepository.findOne({
      where: {
        id: id
      },
      relations: [
        'owner',
        'messages',
        'admins',
        'users',
        'bannedUsers', 'bannedUsers.user',
        'mutedUsers', 'mutedUsers.user'
      ]
    });
  }

  getAllNoMessages(): Promise<Channel[]> {
    return this.channelRepository.find({
      relations: [
        'owner',
        'admins',
        'users',
        'bannedUsers', 'bannedUsers.user',
        'mutedUsers', 'mutedUsers.user'
      ]
    });
  }

  getOneNoMessages(id: number): Promise<Channel> {
    return this.channelRepository.findOne({
      where: {
        id: id
      },
      relations: [
        'owner',
        'admins',
        'users',
        'bannedUsers', 'bannedUsers.user',
        'mutedUsers', 'mutedUsers.user'
      ]
    });
  }

  async addUser(channelId: number, user: UserDTO) {
    try {
      const newUser = await this.channelRepository.createQueryBuilder()
        .relation(Channel, 'users')
        .of({ id: channelId })
        .add(user);
      return {
        message: `User ${user.id} added to channel ${channelId}`,
        data: newUser,
        added: true,
      };
    } catch (err) {
      return {
        message: `User ${user.id} don't added to channel ${channelId}`,
        data: undefined,
        added: false,
      };
    }
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
        name: data.name,
        type: data.type,
      };
      if (data.type === 'protected' && data.password)
        __ret['password'] = data.password;
      await this.channelRepository.createQueryBuilder()
        .update(Channel)
        .set(__ret)
        .where('id = :id', { id: data.id })
        .execute();
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
