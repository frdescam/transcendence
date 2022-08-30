import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class WsJwtSpectateGuard extends AuthGuard('ws-jwt-spectate') {
  handleRequest<User>(error: any, user: User): User {
    return user;
  }
}