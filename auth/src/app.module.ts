import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

// clean stuff of auth.module and add here instead

@Module({
  imports: [ConfigModule.forRoot({envFilePath: ['./src/auth/.auth.env'], isGlobal: true,}), AuthModule,],
})
export class AppModule {}
