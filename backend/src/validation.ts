import { ValidationPipe, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { ValidationError } from 'class-validator';

const logger: Logger = new Logger('ValidationPipe');

export const socketValidationPipe = new ValidationPipe({
	transform: true,
	transformOptions: { enableImplicitConversion: true },
	whitelist: true,
	exceptionFactory: (errors: ValidationError[]) =>
	{
		if (process.env.NODE_ENV !== 'production')
			logger.debug(errors);
		return new WsException('Input validation error');
	}
});

export const controllerValidationPipe = new ValidationPipe({
	transform: true,
	transformOptions: { enableImplicitConversion: true },
	whitelist: true
});