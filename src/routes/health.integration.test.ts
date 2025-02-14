import request from 'supertest';
import app from '../app';

describe('Health Check Endpoint', () => {
  it('should return a valid health check response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(new Date(response.body.data.timestamp)).toBeInstanceOf(Date);
  });
});
