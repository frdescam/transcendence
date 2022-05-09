import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import * as path from 'path';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(parseInt(process.env.BACK_PORT, 10));
}
bootstrap();
