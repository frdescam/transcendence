import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { db_config } from './db.config';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity'

// clean stuff of auth.module and add here instead
// Typeorm ForFeature here should be in users.

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['./src/auth/.auth.env'], isGlobal: true, }), AuthModule, TypeOrmModule.forRoot(db_config), TypeOrmModule.forFeature([User,]),],
})
export class AppModule { }
