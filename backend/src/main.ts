import * as process from 'process';
import * as cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter, NotFoundExceptionFilter } from './filter';

(async () =>
{
  const app = await NestFactory.create(AppModule, {
    logger: (process.env.NODE_ENV === 'production')
      ? false
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.enableCors({origin: ["http://127.0.0.1:3000", "http://localhost:3000"], allowedHeaders: ['content-type'], credentials: true});
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.setGlobalPrefix('api');
  await app.listen(process.env.BACK_PORT);
})();