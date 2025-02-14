import { describe, it, expect } from 'vitest';
import { getHealthCheck } from './index.js';

describe('getHealthCheck', () => {
  it('should return a valid health check response', async () => {
    const result = await getHealthCheck();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ok');
      expect(new Date(result.data.timestamp)).toBeInstanceOf(Date);
    }
  });
});
