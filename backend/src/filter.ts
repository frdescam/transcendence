import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  NotFoundException
} from '@nestjs/common';

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response
      .status(exception.getStatus())
      .json({
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        message: exception.message ?? 'Unexpected error'
      });
  }
}

@Catch(NotFoundException)
class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response
      .status(exception.getStatus())
      .json({
        statusCode: '404',
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url
      });
  }
}

export {
  HttpExceptionFilter,
  NotFoundExceptionFilter
};
