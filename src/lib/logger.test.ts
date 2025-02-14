import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from './logger';

describe('Logger', () => {
  const traceId = 'test-trace-id';
  let logger: Logger;
  const mockDate = new Date('2024-02-14T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    logger = new Logger(traceId);
    vi.spyOn(console, 'debug');
    vi.spyOn(console, 'info');
    vi.spyOn(console, 'warn');
    vi.spyOn(console, 'error');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should log debug messages with correct format', () => {
    const message = 'Debug message';
    const data = { key: 'value' };

    logger.debug(message, data);

    expect(console.debug).toHaveBeenCalledWith(
      `[${mockDate.toISOString()}] [${traceId}] [DEBUG] ${message} - "${JSON.stringify(data)}"`,
    );
  });

  it('should log info messages with correct format', () => {
    const message = 'Info message';

    logger.info(message);

    expect(console.info).toHaveBeenCalledWith(
      `[${mockDate.toISOString()}] [${traceId}] [INFO] ${message}`,
    );
  });

  it('should log warn messages with correct format', () => {
    const message = 'Warning message';
    const data = { warning: true };

    logger.warn(message, data);

    expect(console.warn).toHaveBeenCalledWith(
      `[${mockDate.toISOString()}] [${traceId}] [WARN] ${message} - "${JSON.stringify(data)}"`,
    );
  });

  it('should log error messages with correct format', () => {
    const message = 'Error message';
    const error = new Error('Test error');

    logger.error(message, error);

    expect(console.error).toHaveBeenCalledWith(
      `[${mockDate.toISOString()}] [${traceId}] [ERROR] ${message} - "${JSON.stringify(error)}"`,
    );
  });

  it('should validate log level using zod schema', () => {
    const message = 'Test message';

    expect(() => logger.debug(message)).not.toThrow();
    expect(() => logger.info(message)).not.toThrow();
    expect(() => logger.warn(message)).not.toThrow();
    expect(() => logger.error(message)).not.toThrow();
  });
});
