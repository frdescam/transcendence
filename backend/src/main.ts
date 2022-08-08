// clean half this imports

import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import * as cookieParser from 'cookie-parser';

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

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

export class SocketAdapter extends IoAdapter {
	createIOServer(
		port: number,
		options?: ServerOptions & {
			namespace?: string;
			server?: any;
		},
	) {
		const server = super.createIOServer(port, {
			...options,
			cors: {
				origin: 'http://127.0.0.1:3000',
				//methods: ['GET', 'POST'],
				credentials: true,
        //allowedHeaders: ["Authentication"],
			},
		});
		return server;
	}
}
//* put this into its own file LULz

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: (process.env.NODE_ENV === 'production')
      ? false
      : ['log', 'error', 'warn', 'debug', 'verbose'],
      cors: true
  });
  // use pipe to validate 42 data?
 // app.useGlobalPipes(new ValidationPipe({
  //  whitelist: true,
  //}))
  app.enableCors({origin: "http://127.0.0.1:3000", allowedHeaders: ['Content-Type', 'Authentication', 'Refresh'], credentials: true});
  app.useWebSocketAdapter(new SocketAdapter(app));

	// CSRF Protection
	// See: https://docs.nestjs.com/security/csrf
	//app.use(csurf({ cookie: { sameSite: true, httpOnly: true } }));
  // for cookies
  app.use(cookieParser());
  // maybe not needed now? global filters
  // app.setGlobalPrefix('api');
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.setGlobalPrefix('api');
  await app.listen(process.env.BACK_PORT);
}
bootstrap();