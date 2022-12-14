import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class ErrorFilter implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception.status) {
      status = exception.status;
    }

    if (exception.response) {
      const res = exception.response;
      response
        .code(status)
        .send(res);
    }

    else {
      response
        .code(status)
        .send({
          statusCode: status,
          message: exception.message
        });
    }
  }
}