import { Injectable } from '@nestjs/common';
import { TypesOf2FA, User } from './user.entity';

@Injectable()
export class AppService {
  getHello(): string {
    let repo = User.getRepository();
    let user1 = repo.create({
        pseudo: "user1",
        avatar: "null",
        password: "pass",
        typeOf2FA: TypesOf2FA.NONE,
        valueOf2FA: "null",
        xp: 0.0,
    });
    repo.save(user1);
    console.log("written new entity!");
    return 'Hello World!';
  }
}
