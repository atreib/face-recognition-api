import { z } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';

// Logger level schema and type
export const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

// Log message schema and type
export const LogMessageSchema = z.object({
  level: LogLevelSchema,
  message: z.string(),
  traceId: z.string(),
  timestamp: z.string(),
  data: z.unknown().optional(),
});
export type LogMessage = z.infer<typeof LogMessageSchema>;

export class Logger {
  private traceId: string;

  constructor(traceId: string) {
    this.traceId = traceId;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown,
  ): LogMessage {
    return LogMessageSchema.parse({
      level,
      message,
      traceId: this.traceId,
      timestamp: new Date().toISOString(),
      data: data ? JSON.stringify(data) : undefined,
    });
  }

  private log(logMessage: LogMessage): void {
    const { level, message, traceId, timestamp, data } = logMessage;
    const formattedMessage = `[${timestamp}] [${traceId}] [${level.toUpperCase()}] ${message}${
      data ? ` - "${data}"` : ''
    }`;

    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: unknown): void {
    this.log(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    this.log(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    this.log(this.formatMessage('error', message, data));
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
