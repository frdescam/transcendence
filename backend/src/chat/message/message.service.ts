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
      const channel = this.messageRepository.create(data);
      await this.messageRepository.save(channel);
      return {
        message: 'Message created',
        timestamp: Date,
        created: true,
      };
    } catch (___) {
      return {
        message: 'Message don\'t created',
        timestamp: Date,
        created: false,
      };
    }
  }

  async update(data: MessageDTO) {
    try {
      const tempId = data.id;
      delete data.id;
      const update = await this.getOne(data.channel.id, data.id);
      update.content = data.content;
      await this.messageRepository.update({ id: tempId }, update);
      return {
        message: 'Message updated',
        timestamp: Date,
        updated: true,
      };
    } catch (___)
    {
      return {
        message: 'Message don\'t updated',
        timestamp: Date,
        updated: false
      };
    }
  }

  async remove(data: MessageDTO)
  {
    try {
      await this.messageRepository.delete({ id: data.id });
      return {
        message: 'Message deleted',
        id: data.id,
        timestamp: Date,
        deleted: true,
      };
    } catch (___)
    {
      return {
        message: 'Message don\'t deleted',
        id: data.id,
        timestamp: Date,
        deleted: false,
      };
    }
    
  }
}
