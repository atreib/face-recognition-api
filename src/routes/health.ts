import { Router } from 'express';
import { withComposable } from '../middleware/composable';
import { getHealthCheck } from '../use-cases/health';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get(
  '/',
  withComposable((_req, _res) => getHealthCheck()),
);

export default router;
