import { composable } from 'composable-functions';
import type { HealthCheckResponse } from '../types/health.js';

export const getHealthCheck = composable(
  () =>
    ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }) satisfies HealthCheckResponse,
);
