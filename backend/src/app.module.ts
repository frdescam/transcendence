import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Match } from './match.entity';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "password",
      database: "user",
      entities: [User, Match],
      synchronize: true,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
