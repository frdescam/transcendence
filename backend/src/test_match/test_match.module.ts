import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/match.entity';
import { TestUserModule } from 'src/test_user/test_user.module';
import { TestMatchController } from './test_match.controller';
import { TestMatchService } from './test_match.service';

@Module({
  imports: [
      TypeOrmModule.forFeature([Match]),
      TestUserModule,
  ],
  controllers: [TestMatchController],
  providers: [TestMatchService],
  exports: [TestMatchService],
})
export class TestMatchModule {}
