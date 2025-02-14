import { describe, it, expect } from 'vitest';
import { getHealthCheck } from './health.js';
import { HealthCheckResponseSchema } from '../types/health.js';

describe('getHealthCheck', () => {
  it('should return a valid health check response', async () => {
    const result = await getHealthCheck();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(() => HealthCheckResponseSchema.parse(result.data)).not.toThrow();
      expect(result.data.status).toBe('ok');
      expect(new Date(result.data.timestamp)).toBeInstanceOf(Date);
    }
  });
});
