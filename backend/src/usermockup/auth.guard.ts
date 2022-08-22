import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SocketMockupAuthGuard implements CanActivate
{
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToWs().getClient();
    const user = request.handshake.auth.user;
    if (!user)
      return false;
    const userId = parseInt(user);

    request.user = {id: userId};

    return true;
  }
}

@Injectable()
export class HTTPMockupAuthGuard implements CanActivate
{
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.cookies.USER;
    console.log(user);
    if (!user)
      return false;
    const userId = parseInt(user);

    request.user = {id: userId};

    return true;
  }
}
