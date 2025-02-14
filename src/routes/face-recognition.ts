import { Router } from 'express';
import { findMatches, getAlbumImages } from '../use-cases/face-recognition';
import {
  FaceMatchRequestSchema,
  AlbumImagesRequestSchema,
  ImagePathRequestSchema,
} from '../types/face-recognition';
import path from 'path';

const router = Router();

/**
 * @openapi
 * /face-recognition/match:
 *   post:
 *     tags: [Face Recognition]
 *     summary: Find face matches in an album
 *     description: Finds faces in the specified album that match the target face image
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FaceMatchRequest'
 *     responses:
 *       200:
 *         description: Successfully found matches
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FaceMatchResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /face-recognition/album/{albumName}/images:
 *   get:
 *     tags: [Face Recognition]
 *     summary: Get all images in an album by name
 *     description: Returns a list of all image paths in the specified album
 *     parameters:
 *       - in: path
 *         name: albumName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the album to get images from
 *     responses:
 *       200:
 *         description: Successfully retrieved album images
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlbumImagesResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @openapi
 * /face-recognition/image/{imagePath}:
 *   get:
 *     tags: [Face Recognition]
 *     summary: Get an image by path
 *     description: Returns the image file at the specified path
 *     parameters:
 *       - in: path
 *         name: imagePath
 *         required: true
 *         schema:
 *           type: string
 *         description: Path to the image file
 *     responses:
 *       200:
 *         description: Successfully retrieved image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
