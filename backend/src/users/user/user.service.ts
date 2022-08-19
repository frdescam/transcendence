import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { AuthDto } from '../../auth/dto';
import { UserDTO } from '../orm/user.dto';
import { User } from '../orm/user.entity';


@Injectable({})
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async turnOn2FA(userId: number) {
    return this.userRepository.update(userId, {
      is2FActive: true,
    });
  }

  async turnOff2FA(userId: number) {
    return this.userRepository.update(userId, {
      is2FActive: false,
      secretOf2FA: null,
    });
  }

  async set2FASecret(secret: string, userId: number) {
    // change return here
    return this.userRepository.update(userId, {
      secretOf2FA: secret,
    });
  }

  async findOne(user_dto: AuthDto): Promise<User> {
    // print this when testing multiple pseudos
    //console.log(await this.getUniquePseudo(user_dto.pseudo));
    //console.log(user_dto, await this.userRepository.findOne({where: user_dto}));
    return this.userRepository.findOne({where: user_dto}); // if multiple pseudos r the same, does this work?
    // return this.userRepository.findOne({
    //     where: {
    //         fortytwo_id: user_dto.fortytwo_id,
    //     }
    // });
  }

  async findAll() {
    return this.userRepository.find();
  }

  // need to test more!
  // and use this when changing pseudo too not just register
  // cant have mutiple ppl with same pseudo nick, nickname
  private async getUniquePseudo(login: string): Promise<string> {
    const found: User = await this.userRepository.findOne({ where: {pseudo: login} });

    if (!found)
      return login;

    //const last: User = await this.userRepository.findLastWithNameLike(login);

    // if last not needed then can erase Like include of typeorm
    const last: User = await this.userRepository.findOne({
      select: ['id'],
      where: { pseudo: Like(`${login}%`) },
      order: {
        id: 'DESC',
      },
    });

    return `${login}#${last?.id + 1}`;
  }

  async signup(user_dto: AuthDto): Promise<User> {
    user_dto.pseudo = await this.getUniquePseudo(user_dto.pseudo);
    console.log(user_dto);
    const user: User = this.userRepository.create({
      ...user_dto,
    });

    //console.log(user);
    return this.userRepository.save(user);
  }

  async setRefreshToken(user: User, token: string): Promise<void> {
    if (!token) {
      this.userRepository.update(user.id, {
        refresh_token: token,
        //add status of user as disconnected is needed to know if they r logged in or out?
      });
    } else {
      this.userRepository.update(user.id, {
        refresh_token: token,
      });
    }
  }
  
  //#region Part Clément
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
    // user.password = await argon2.hash(user.password); // A hash pour la sécu
    await this.userRepository.save(user);
    return user;
  }

  async update(data: UserDTO) {
    const tempId = data.id;
    delete data.id;
    const update = await this.getOne(tempId);
    /*
    if (!await argon2.verify(update.password, data.password))
      data.password = await argon2.hash(data.password);
    */
    await this.userRepository.update({ id: tempId }, update);
  }

  async delete(data: UserDTO) {
    await this.userRepository.delete({ id: data.id });
    return { deleted: true };
    /*
    if (await argon2.verify(user.password, data.password)) {
      await this.userRepository.delete({ id: data.id });
      return { deleted: true };
    }
    return {
      error: 'Password don\'t recognize',
      deleted: false,
    };
    */
  }
  //#endregion
}
