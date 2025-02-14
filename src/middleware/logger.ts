import { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { Logger } from '../lib/logger';

// Extend Express Request type using module augmentation
declare module 'express' {
  interface Request {
    logger: Logger;
    traceId: string;
  }
}

export const loggerMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const traceId = randomUUID();
  const logger = new Logger(traceId);

  req.logger = logger;
  req.traceId = traceId;

  logger.info('Request started', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });

  next();
};
