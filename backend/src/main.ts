import * as process from 'process';
import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cors from './cors';
import { HttpExceptionFilter, NotFoundExceptionFilter } from './filter';

(async () =>
{
  const app = await NestFactory.create(AppModule, {
    logger: (process.env.NODE_ENV === 'production')
      ? false
      : ['log', 'error', 'warn', 'debug', 'verbose'],
    cors
  });
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.setGlobalPrefix('api');
  await app.listen(process.env.BACK_PORT);
})();