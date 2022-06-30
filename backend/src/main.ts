import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';

process.on('uncaughtException', (err) => {
  console.error(err);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: (process.env.NODE_ENV === 'production')
      ? false
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(process.env.BACK_PORT);
}
bootstrap();
