import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors.js';
import { logger } from '../common/logger.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.errorCode}] on ${req.method} ${req.path}: ${err.message}`, {
      statusCode: err.statusCode,
      details: err.details,
    });

    res.status(err.statusCode).json({
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  logger.error(`Unhandled error on ${req.method} ${req.path}`, err);

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Terjadi kesalahan internal pada server',
    },
  });
};
