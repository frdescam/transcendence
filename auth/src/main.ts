// clean half this imports

import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// put this into its own file LULz
// for 404!

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        response.send("NOPE! this is my 404 BRUH");
    }
}
//* put this into its own file LULz

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // use pipe to validate 42 data?
 // app.useGlobalPipes(new ValidationPipe({
  //  whitelist: true,
  //}))
  app.useGlobalFilters(new NotFoundExceptionFilter());
  await app.listen(3000);
}
bootstrap();