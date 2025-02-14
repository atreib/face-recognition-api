import { Router } from 'express';
import { getHealthCheck } from '../functions/health.js';
import { withComposable } from '../middleware/composable.js';

const router = Router();

router.get(
  '/',
  withComposable((_req, _res) => getHealthCheck()),
);

export default router;
