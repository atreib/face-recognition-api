import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { withComposable } from './composable.js';
import { success, failure } from 'composable-functions';

describe('withComposable', () => {
  const mockRequest = {} as Request;
  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const mockNext = vi.fn() as unknown as (err?: unknown) => void;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful results', async () => {
    const mockData = { foo: 'bar' };
    const handler = vi.fn().mockResolvedValue(success(mockData));
    const middleware = withComposable(handler);

    await middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockData,
      errors: [],
    });
  });

  it('should handle failure results with 500 status', async () => {
    const mockError = new Error('Test error');
    const handler = vi.fn().mockResolvedValue(failure([mockError]));
    const middleware = withComposable(handler);

    await middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ message: 'Test error' }],
    });
  });

  it('should handle invalid result format', async () => {
    const handler = vi.fn().mockResolvedValue({ invalid: 'format' });
    const middleware = withComposable(handler);

    await middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ message: 'Invalid composable result format' }],
    });
  });

  it('should handle thrown errors', async () => {
    const mockError = new Error('Test error');
    const handler = vi.fn().mockRejectedValue(mockError);
    const middleware = withComposable(handler);

    await middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Test error',
    });
  });
});
