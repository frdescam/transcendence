import { Module } from '@nestjs/common';

import { _UserModule } from './user/user.module';

@Module({
  imports: [_UserModule],
  exports: [_UserModule]
})
export class UsersModule {}