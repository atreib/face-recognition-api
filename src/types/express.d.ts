import { Logger } from '../lib/logger';

declare module 'express-serve-static-core' {
  interface Request {
    logger: Logger;
    traceId: string;
  }
}
