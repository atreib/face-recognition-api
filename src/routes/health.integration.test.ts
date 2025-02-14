import request from 'supertest';
import app from '../app.js';
import { HealthCheckResponseSchema } from '../types/health.js';

describe('Health Check Endpoint', () => {
  it('should return a valid health check response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(() => HealthCheckResponseSchema.parse(response.body)).not.toThrow();
    expect(response.body.status).toBe('ok');
    expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
  });
});
