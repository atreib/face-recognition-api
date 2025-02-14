import { Router } from 'express';
import { findMatches } from '../use-cases/face-recognition';
import { FaceMatchRequestSchema } from '../types/face-recognition';

const router = Router();

router.post('/match', async (req, res) => {
  try {
    const request = FaceMatchRequestSchema.parse(req.body);
    const result = await findMatches(request);

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.errors.map((e) => e.message).join(', ') });
    }

    res.json(result.data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
