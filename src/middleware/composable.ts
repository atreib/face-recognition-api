import { NextFunction, Request, Response } from 'express';
import type { Result } from 'composable-functions';
import { z } from 'zod';

export type ComposableRequestHandler<T = unknown> = (
  req: Request,
  res: Response,
) => Promise<Result<T>>;

export const ComposableResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: z.unknown(),
    errors: z.array(z.instanceof(Error)).optional(),
  }),
  z.object({
    success: z.literal(false),
    data: z.unknown().optional(),
    errors: z.array(z.instanceof(Error)),
  }),
]);

const serializeError = (error: Error): { message: string } => ({
  message: error.message,
});

export const withComposable = (handler: ComposableRequestHandler) => {
  return async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await handler(req, res);
      const validationResult = ComposableResultSchema.safeParse(result);

      if (!validationResult.success) {
        res.status(500).json({
          success: false,
          errors: [
            serializeError(new Error('Invalid composable result format')),
          ],
        });
        return;
      }

      if (!result.success) {
        res.status(500).json({
          ...result,
          errors: result.errors.map(serializeError),
        });
        return;
      }

      res.json({
        ...result,
        errors: result.errors?.map(serializeError) ?? [],
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json(serializeError(error));
      } else {
        res.status(500).json({
          message: 'An unknown error occurred',
        });
      }
    }
  };
};
