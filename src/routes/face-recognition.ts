import { Router } from 'express';
import { findMatches, getAlbumImages } from '../use-cases/face-recognition';
import {
  FaceMatchRequestSchema,
  AlbumImagesRequestSchema,
  ImagePathRequestSchema,
} from '../types/face-recognition';
import path from 'path';

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

router.get('/album/:albumName/images', async (req, res) => {
  const { logger } = req;

  try {
    logger.debug('Parsing album images request');
    const request = AlbumImagesRequestSchema.parse({
      albumName: req.params.albumName,
    });

    logger.info('Processing album images request', { request });
    const result = await getAlbumImages(request, { logger });

    if (!result.success) {
      logger.warn('Album images request failed validation', {
        errors: result.errors,
      });
      if (result.errors[0]?.message === 'Unexpected error') {
        return res.status(400).json({ error: result.errors[0].message });
      }
      return res.json({ images: [] });
    }

    logger.info('Album images request successful', { result: result.data });
    res.json(result.data);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Album images request failed', { error });
      res.status(400).json({ error: error.message });
    } else {
      logger.error('Internal server error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/image/:imagePath(*)', async (req, res) => {
  const { logger } = req;

  try {
    logger.debug('Parsing image path request');
    const request = ImagePathRequestSchema.parse({
      imagePath: req.params.imagePath,
    });

    logger.info('Processing image request', { request });

    // Validate that the path is within our storage directory
    const fullPath = path.join(process.cwd(), request.imagePath);
    if (!fullPath.startsWith(path.join(process.cwd(), 'storage'))) {
      logger.warn('Invalid image path - outside storage directory', {
        fullPath,
      });
      return res.status(400).json({ error: 'Invalid image path' });
    }

    // Send the file
    logger.info('Sending image file', { path: fullPath });
    res.sendFile(fullPath);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Image request failed', { error });
      res.status(400).json({ error: error.message });
    } else {
      logger.error('Internal server error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;
