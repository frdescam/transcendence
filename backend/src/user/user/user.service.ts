import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';

import { User } from '../orm/user.entity';
import { UserDTO } from '../orm/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  getOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id: id,
      }
    });
  }

  async create(data: UserDTO) {
    const user = this.userRepository.create(data);
    user.password = await argon2.hash(user.password);
    await this.userRepository.save(user);
    return user;
  }

  async update(data: UserDTO) {
    const tempId = data.id;
    delete data.id;
    const update = await this.getOne(tempId);
    if (!await argon2.verify(update.password, data.password))
      data.password = await argon2.hash(data.password);
    await this.userRepository.update({ id: tempId }, update);
  }

  async delete(data: UserDTO) {
    const user = await this.getOne(data.id);
    if (await argon2.verify(user.password, data.password)) {
      await this.userRepository.delete({ id: data.id });
      return { deleted: true };
    }
    return {
      error: 'Password don\'t recognize',
      deleted: false,
    };
  }
}
