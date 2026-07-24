import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

// Create logger
export const logger = pino({
  level: 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Logger middleware
export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const requestId = req.requestId || 'unknown';

    logger.info({
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTimeMs: responseTime,
    });
  });

  next();
}