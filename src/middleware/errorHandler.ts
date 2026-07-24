import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';

  logger.error({
    requestId,
    error: err.message,
    stack: err.stack,
  });

  // Send consistent error response
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      requestId,
    },
  });
}