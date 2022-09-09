import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MessageDTO } from '../orm/message.dto';
import { Message } from '../orm/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>
  ) {}

  getOne(channelId: number, messageId: number): Promise<Message> {
    return this.messageRepository.createQueryBuilder('message')
      .where('message.channel.id = :id', { id: channelId })
      .where('message.id = :id', { id: messageId })
      .leftJoinAndSelect('message.creator', 'user')
      .orderBy('message.timestamp', 'ASC')
      .getOne();
  }

  getAll(channelId: number): Promise<Message[]> {
    return this.messageRepository.createQueryBuilder('message')
      .where('message.channel.id = :id', { id: channelId })
      .leftJoinAndSelect('message.creator', 'user')
      .orderBy('message.timestamp', 'ASC')
      .getMany();
  }

  getPages(channelId: number, offset: number, limit: number): Promise<Message[]> {
    return this.messageRepository.createQueryBuilder('message')
      .where('message.channel.id = :id', { id: channelId })
      .leftJoinAndSelect('message.creator', 'user')
      .orderBy('message.timestamp', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  async create(data: MessageDTO) {
    try {
      const newMessage = await this.messageRepository.createQueryBuilder()
        .insert()
        .into(Message)
        .values([
          {
            creator: data.create,
            channel: data.channel,
            content: data.content,
          }
        ])
        .execute();
      return {
        message: 'Message created',
        channel: data.channel.id,
        data: await this.getOne(data.channel.id, newMessage.generatedMaps[0].id),
        created: true,
      };
    } catch (___) {
      return {
        message: 'Message don\'t created',
        channel: data.channel.id,
        data: undefined,
        created: false,
      };
    }
  }

  async update(data: MessageDTO) {
    try {
      await this.messageRepository.createQueryBuilder()
        .update(Message)
        .set({ content: data.content })
        .where('id = :id', { id: data.id })
        .execute();
      return {
        message: 'Message updated',
        channel: data.channel.id,
        data: await this.getOne(data.channel.id, data.id),
        timestamp: Date,
        updated: true,
      };
    } catch (___)
    {
      return {
        message: 'Message don\'t updated',
        channel: data.channel.id,
        data: undefined,
        timestamp: Date,
        updated: false
      };
    }
  }

  async removeAll(channelId: number)
  {
    try {
      const __ret = await this.messageRepository.createQueryBuilder()
        .delete()
        .from(Message)
        .where('channel.id = :id', { id: channelId })
        .execute();
      return {
        message: 'Message(s) deleted',
        channel: channelId,
        deleted: true,
      };
    } catch (___) {
      return {
        message: 'Message(s) don\'t deleted',
        channel: channelId,
        deleted: false,
      };
    }
  }

  async remove(data: MessageDTO)
  {
    try {
      await this.messageRepository.createQueryBuilder()
        .delete()
        .from(Message)
        .where('id = :id', { id: data.id })
        .execute();
      
      return {
        message: 'Message deleted',
        channel: data.channel.id,
        id: data.id,
        timestamp: Date,
        deleted: true,
      };
    } catch (___)
    {
      return {
        message: 'Message don\'t deleted',
        channel: data.channel.id,
        id: data.id,
        timestamp: Date,
        deleted: false,
      };
    }
  }
}
