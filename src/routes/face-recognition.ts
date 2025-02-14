import { Router } from 'express';
import { findMatches } from '../use-cases/face-recognition';
import { FaceMatchRequestSchema } from '../types/face-recognition';

const router = Router();

router.post('/match', async (req, res) => {
  const { logger } = req;

  try {
    logger.debug('Parsing face match request');
    const request = FaceMatchRequestSchema.parse(req.body);

    logger.info('Processing face match request', { request });
    const result = await findMatches(request, { logger });

    if (!result.success) {
      const errorMessage = result.errors.map((e) => e.message).join(', ');
      logger.warn('Face match request failed validation', {
        errors: result.errors,
      });
      return res.status(400).json({ error: errorMessage });
    }

    logger.info('Face match request successful', { result: result.data });
    res.json(result.data);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Face match request failed', { error });
      res.status(400).json({ error: error.message });
    } else {
      logger.error('Internal server error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
