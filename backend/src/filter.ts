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
    const exceptionRes = exception.getResponse();
    let message;
    if (typeof exceptionRes === 'string')
      message = exceptionRes;
    else if (typeof exceptionRes === 'object' && 'message' in exceptionRes)
      message = exceptionRes['message'];
    else if ('message' in exception)
      message = exception['message'];
    else
      message = 'Unexpected error';

    response
      .status(exception.getStatus())
      .json({
        statusCode: exception.getStatus(),
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        message
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
