import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('auth-jwt-refresh') {
  handleRequest<User>(error: any, user: User): User {
    if (error || !user)
    {
      console.log('error: ', error, user);
      throw new UnauthorizedException('Invalid JWT (Refresh) Token.');
    }
    return user;
  }
}