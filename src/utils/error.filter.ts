import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ErrorFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception.status) {
      status = exception.status;
    }

    if (exception.response) {
      const res = exception.response;
      response
        .status(status)
        .send(res);
    }

    else {
      response
        .status(status)
        .send({
          statusCode: status,
          message: exception.message
        });
    }
  }
}