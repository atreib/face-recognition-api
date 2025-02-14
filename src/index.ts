import app from './app';
import { config } from 'dotenv';
import { Logger } from './lib/logger';
import { randomUUID } from 'crypto';

config();

const port = process.env.PORT || 3000;

// Create a logger instance for server startup
const serverLogger = new Logger(randomUUID());

app.listen(port, () => {
  serverLogger.info('Server started', { port });
});
