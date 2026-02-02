import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof ZodError) {
      const message =
        exception.errors?.[0]?.message ?? 'Dados inválidos. Verifique os campos.';
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
      });
      return;
    }

    if (exception && typeof (exception as { getStatus?: () => number }).getStatus === 'function') {
      const ex = exception as { getStatus: () => number; getResponse: () => unknown };
      const status = ex.getStatus();
      const body = ex.getResponse();
      res.status(status).json(
        typeof body === 'object' && body !== null ? body : { message: body },
      );
      return;
    }

    this.logger.error(exception);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno. Tente novamente.',
      error: 'Internal Server Error',
    });
  }
}
