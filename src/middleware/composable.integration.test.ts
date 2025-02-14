import express, { Request, Response } from 'express';
import request from 'supertest';
import { success, failure } from 'composable-functions';
import { withComposable } from './composable';

describe('Composable Middleware Integration', () => {
  const app = express();

  app.get(
    '/success',
    withComposable((_req: Request, _res: Response) =>
      Promise.resolve(success({ message: 'Success' })),
    ),
  );

  app.get(
    '/failure',
    withComposable((_req: Request, _res: Response) =>
      Promise.resolve(failure([new Error('Test error')])),
    ),
  );

  app.get(
    '/invalid',
    withComposable((_req: Request, _res: Response) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Promise.resolve({ invalid: 'format' } as any),
    ),
  );

  app.get(
    '/error',
    withComposable((_req: Request, _res: Response) => {
      throw new Error('Unexpected error');
    }),
  );

  it('should handle successful responses', async () => {
    const response = await request(app).get('/success');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { message: 'Success' },
      errors: [],
    });
  });

  it('should handle failure responses with 500 status', async () => {
    const response = await request(app).get('/failure');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      errors: [{ message: 'Test error' }],
    });
  });

  it('should handle invalid result format', async () => {
    const response = await request(app).get('/invalid');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      errors: [{ message: 'Invalid composable result format' }],
    });
  });

  it('should handle thrown errors', async () => {
    const response = await request(app).get('/error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Unexpected error',
    });
  });
});
