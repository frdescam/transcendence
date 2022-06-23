import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'

// use env?
import { db_config } from './db.config';

// clean stuff of auth.module and add here instead

@Module({
  imports: [
    // env
    ConfigModule.forRoot({ envFilePath: ['./src/auth/.auth.env'], isGlobal: true, }), 
    // db connection
    TypeOrmModule.forRoot(db_config),
    AuthModule,
    UsersModule,],
})
export class AppModule { }
