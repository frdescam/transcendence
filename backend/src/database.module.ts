import * as process from 'process';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeormLogger } from './typeorm.logger';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'transcendence',
        password: 'password',
        database: 'transcendence',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: !(process.env.NODE_ENV === 'production'),
        logging: new TypeormLogger()
      }),
    }),
  ],
})
export class DatabaseModule {}