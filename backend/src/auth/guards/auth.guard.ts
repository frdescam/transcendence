import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OAuthGuard extends AuthGuard('auth') { // change name of guard here to oauth?
  handleRequest<User>(error: any, user: User): User {
    if (error || !user)
    {
      console.log('error: ', error, user);
      throw new UnauthorizedException('OAuth guard failed.'); // return object so that frontend can show bootiful msg to user?
      // send to index or to error page?
      //response.redirect('/');
    }
    return user;
  }
}