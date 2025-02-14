import { Router } from 'express';
import { getHealthCheck } from '../use-cases/health/index';
import { withComposable } from '../middleware/composable';

const router = Router();

router.get(
  '/',
  withComposable((_req, _res) => getHealthCheck()),
);

export default router;
