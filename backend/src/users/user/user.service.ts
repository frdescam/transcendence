import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, LessThanOrEqual, Like, Not, Repository } from 'typeorm';
import { env } from 'process';

import { AuthDto } from '../../auth/dto';
import { UserDTO } from '../orm/user.dto';
import { User } from '../orm/user.entity';
import { Match } from 'src/match/orm/match.entity';
import { AchievementsEnumName, AchievementsDto, Achievements} from '../orm/achievements.dto';

@Injectable({})
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}
  //#region Part Leo
  async turnOn2FA(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      is2FActive: true,
    });
  }

  async turnOff2FA(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      is2FActive: false,
      secretOf2FA: null,
    });
  }

  async set2FASecret(secret: string, userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      secretOf2FA: secret,
    });
  }

  // should add something if id fails?
  async updateAvatar(filename: string, userId: number): Promise<User> {
    // const user : User = await this.findOne({id: userId});

    // if (!user)
    //   return null;

    // should add something if id fails?
    const result = await this.userRepository.createQueryBuilder() // raw sql type
      .update({
        avatar: `${env.API_HOST}/user/avatar/${filename}`,
      })
      .where({
        id: userId,
      })
      .returning('*')
      .execute();

    //console.log("result: ",result.raw[0]);
    // return result.raw[0];
    return this.sanitizeUser(result.raw[0]);
    //  return await this.userRepository.save({
    // 	id: userId,
    //  	avatar: filename,
    //  });
  }
  
  // should add something if id fails?
  async updatePseudo(new_pseudo: string, userId: number) : Promise<User | object> {
    // change return here
    const user: User = await this.userRepository.findOne({pseudo : new_pseudo});

    if (user)
      return {error: 'pseudo already taken!'}; // throw exception?
		
    console.log('updatePseudo: if undefined is good, user: ', user);
		
    const result = await this.userRepository.createQueryBuilder()
      .update({
        pseudo: new_pseudo,
      })
      .where({
        id: userId,
      })
      .returning('*')
      .execute();

    // const user : User = result.raw[0];
		
    console.log('result: ',result.raw[0]);
    //console.log(test_user, user, result.raw[0]);
    return this.sanitizeUser(result.raw[0]);
  }

  async findOneComplete(user_dto: AuthDto): Promise<User> {
    // print this when testing multiple pseudos
    //console.log(await this.getUniquePseudo(user_dto.pseudo));
    return this.userRepository.findOne({where: user_dto});
  }

  // add sanitize to relations? like friends, ignore?
  async sanitizeUser(user: User): Promise<User>
  {
    if (user) {
      delete user.fortytwo_id;
      delete user.refresh_token;
      delete user.secretOf2FA;
    }
    return user;
  }

  async findOne(user_dto: AuthDto): Promise<User> {
    const user: User = await this.userRepository.findOne({where: user_dto});
    return await this.sanitizeUser(user);
  }

  async findAll(): Promise<User[]> {
    const users: User[] = await this.userRepository.find();
    users.forEach(elem => this.sanitizeUser(elem));
    return users;
  }

  async getMatches(id: number): Promise<User> {
    let user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'matchesHome',
        'matchesForeign',
        'matchesHome.winner',
        'matchesHome.userHome',
        'matchesHome.userForeign',
        'matchesForeign.winner',
        'matchesForeign.userHome',
        'matchesForeign.userForeign'
      ]
    });
    if (!user)
      return null;
    user = await this.sanitizeUser(user);
    user.matchesHome.forEach(async (match) =>
    {
      match.winner = await this.sanitizeUser(match.winner);
      match.userForeign = await this.sanitizeUser(match.userForeign);
      match.userHome = await this.sanitizeUser(match.userHome);
    });
    return user;
  }

  //#region achievements
  async getAchievements(userId: number) : Promise<AchievementsDto[]> {
    const user: User = await this.findOne({id : userId});
    if (!user)
      return null;
    
    const player_achievs : AchievementsEnumName[] = user.achievements;
    if (!player_achievs)
      return null;

    const achievs : AchievementsDto[] = [];
    for (const elem of Achievements) {
      if (player_achievs.includes(elem.name))
        achievs.push(elem);
    }
    return achievs;
  }

  // testing purposes, erase later
  async createMockupMatch(user: User, obj: any) {
    const enemy : User = await this.findOne({id : obj.ene});
    const winner : User = await this.findOne({id : obj.win});
    const match = this.matchRepository.create({
      map : 'classic',
      userHome : user,
      userForeign : enemy,
      winner : winner,
      ...obj,
      timestamp : new Date(Date.now()).toLocaleString(),
    });
    await this.matchRepository.save(match);
    return match;
  }

  // testing purposes, erase later
  async resetAchievement(userId : number) : Promise<void> {
    const user : User = (await this.userRepository.findOne(userId));
    this.userRepository.update(user, {achievements : []});
  }

  async checkAchievement(userId: number) : Promise<void> {
    const user : User = (await this.userRepository.findOne(userId, {relations: ['matchesHome', 'matchesForeign', 'matchesWon']}));
    if ((user.matchesForeign && user.matchesForeign.length === 0 && user.matchesHome && user.matchesHome.length === 0) || (user.achievements && user.achievements.includes(AchievementsEnumName.COMPLETE)))
      return ;
    const wins : Match[] = user.matchesWon;
    const home : Match[] = user.matchesHome;
    const foreign : Match[] = user.matchesForeign;
    if (!user.achievements.includes(AchievementsEnumName.ZAPATERO) || !user.achievements.includes(AchievementsEnumName.CLOSE_CALL))
    {
      for (let index = 0; index < wins.length; index++) {
        const element = wins[index];
        if ((!user.achievements.includes(AchievementsEnumName.ZAPATERO)) && element.userHomeScore === 11 && element.userForeignScore === 0 || element.userHomeScore === 0 && element.userForeignScore === 11)
          user.achievements.push(AchievementsEnumName.ZAPATERO);
        if ((!user.achievements.includes(AchievementsEnumName.CLOSE_CALL)) && element.userHomeScore === 11 && element.userForeignScore === 10 || element.userHomeScore === 10 && element.userForeignScore === 11)
          user.achievements.push(AchievementsEnumName.CLOSE_CALL);
      }
    }
    if ((!user.achievements.includes(AchievementsEnumName.TEN_GAMES)) && home.length + foreign.length >= 10)
      user.achievements.push(AchievementsEnumName.TEN_GAMES);
    if ((!user.achievements.includes(AchievementsEnumName.TEN_WINS)) && wins.length >= 10)
      user.achievements.push(AchievementsEnumName.TEN_WINS);
    if ((!user.achievements.includes(AchievementsEnumName.HUNDRED_GAMES)) && home.length + foreign.length >= 100)
      user.achievements.push(AchievementsEnumName.HUNDRED_GAMES);
    if ((!user.achievements.includes(AchievementsEnumName.LEVEL_ONE)) && user.xp >= 10)
      user.achievements.push(AchievementsEnumName.LEVEL_ONE);
    if ((!user.achievements.includes(AchievementsEnumName.COMPLETE)) && user.achievements.length === 6)
      user.achievements.push(AchievementsEnumName.COMPLETE);
    await this.userRepository.save(user);
  }
  //#endregion

  // need to test more!
  // and use this when changing pseudo too not just register
  // cant have mutiple ppl with same pseudo nick, nickname
  private async getUniquePseudo(login: string): Promise<string> {
    const found: User = await this.userRepository.findOne({ where: {pseudo: login} }); // where not needed here

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
    console.log('new user: ' ,user_dto);
    user_dto.rank = await this.userRepository.count({}) + 1;
    const user: User = this.userRepository.create({
      ...user_dto,
    });
    //console.log(user);
    return this.userRepository.save(user);
  }

  async setRefreshToken(user: User, token: string): Promise<void> {
    this.userRepository.update(user.id, {
      refresh_token: token,
    });
  }

  async setStatus(user: User, status: boolean): Promise<void> {
    this.userRepository.update(user.id, {
      connected: status,
    });
  }

  async setNewUser(user: User): Promise<void> {
    this.userRepository.update(user, {
      new_user: false,
    });
  }

  async remove(user: User): Promise<boolean> {
    const result: DeleteResult = (await this.userRepository.delete(user));
    if (result.affected > 0)
      return true;
    return false;
  }

  //#region Franco
  private computeXp(nbWon: number, nbLost: number): number {
    return nbWon * 0.1 + nbLost * 0.0075;
  }

  private computeRatio(nbWon: number, nbLost: number): number {
    const ratio :number = (nbWon / (nbWon + nbLost)) * 100;
    console.log(ratio);
    if (isNaN(ratio) || !isFinite(ratio))
      return 0;
    return parseInt(ratio.toString());
  }

  async updateRanks(userId: number) {
    const user = await this.findOne({ id: userId });
    const usersToUpdate = await this.userRepository.find({
      where: {
        rank: LessThanOrEqual(user.rank),
        xp: LessThanOrEqual(user.xp)
      }
    });
    usersToUpdate.sort((a: User, b: User) => {
      if (a.rank > b.rank)
        return 1;
      else
        return -1;
    });
    console.log('usersToUpdate : ', usersToUpdate);
    const newRank = usersToUpdate[0].rank;
    usersToUpdate.forEach((user) => {
      if (user.id == userId) {
        this.userRepository.update(userId, {
          rank: newRank
        });
      } else {
        this.userRepository.update(user.id, {
          rank: user.rank + 1
        });
      }
    });
  }

  async updateUserStats(userId: number) {
    const nbWon = await this.matchRepository.count({
      where: {
        winner: userId
      }
    });

    const nbLost = await this.matchRepository.count({
      where: [
        { userForeign: userId, winner: Not(userId) },
        { userHome: userId, winner: Not(userId) }
      ],
    });

    console.log('user : ', userId, 'nbWon : ', nbWon, 'nbLost : ', nbLost);

    await this.userRepository.update(userId, {
      xp: this.computeXp(nbWon, nbLost),
      ratio: this.computeRatio(nbWon, nbLost),
    });

    this.updateRanks(userId);
    this.checkAchievement(userId);
    // here call checkAchievs
}
  
  //#region Part Clément
  getAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['blockedUsers', 'blockedUsersBy'] });
  }

  getOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: ['blockedUsers', 'blockedUsersBy']
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
