import { composable } from 'composable-functions';

export const getHealthCheck = composable(
  () =>
    ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }) as const,
);
