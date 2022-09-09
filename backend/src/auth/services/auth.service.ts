import { Injectable } from '@nestjs/common';
import { User } from 'src/users/orm/user.entity';
import { UserService } from 'src/users/user/user.service';
import { AuthDto } from '../dto';

@Injectable({})
export class AuthService {
  constructor(private readonly users_svc: UserService) {}

  async login(user_dto: AuthDto): Promise<User> {
    const user: User = await this.users_svc.findOneComplete(user_dto);

    if (!user)
      return undefined;

    if (user_dto.refresh_token && !(user_dto.refresh_token === user.refresh_token))
      return undefined;

    return user;
  }

  async signup(user_dto: AuthDto): Promise<User> {
    return this.users_svc.signup(user_dto);
  }

  async refresh(user: User, token: string): Promise<void> {
    await this.users_svc.setRefreshToken(user, token);
  }

  async status(user: User, status: boolean): Promise<void> {
    await this.users_svc.setStatus(user, status);
  }

  async logout(user: User): Promise<void> {
    return this.users_svc.setRefreshToken(user, null);
  }
}