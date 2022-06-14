import { Module } from '@nestjs/common';

// import { UserGateway } from './main.gateway';
import { _UserModule } from './user/user.module';

@Module({
  imports: [_UserModule],
  // providers: [UserGateway]
})
export class UserModule {}
