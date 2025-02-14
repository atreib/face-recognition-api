import { Router, Request, Response } from 'express';
import { getHealthCheck } from '../functions/health.js';
import { HealthCheckResponseSchema } from '../types/health.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const result = await getHealthCheck();

  if (!result.success) {
    res.status(500).json({ errors: result.errors.map((e) => e.message) });
    return;
  }

  const validated = HealthCheckResponseSchema.parse(result.data);
  res.json(validated);
});

export default router;
