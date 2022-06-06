import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user.entity';
import { TestUserController } from './test_user.controller';
import { TestUserService } from './test_user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [TestUserController],
  providers: [TestUserService],
  exports: [TestUserService],
})
export class TestUserModule {}