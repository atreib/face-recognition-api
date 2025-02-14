import * as faceapi from 'face-api.js';
import { createCanvas, loadImage, Canvas, Image, ImageData } from 'canvas';
import { composable } from 'composable-functions';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';
import path from 'path';
import {
  FaceMatchRequest,
  AlbumImagesRequest,
} from '../../types/face-recognition';
import { Logger } from '../../lib/logger';

// Monkey patch the faceapi canvas with type assertions for Node's canvas implementation
faceapi.env.monkeyPatch({
  Canvas: Canvas as unknown as typeof HTMLCanvasElement,
  Image: Image as unknown as typeof HTMLImageElement,
  ImageData: ImageData as unknown as typeof globalThis.ImageData,
});

// Load models on startup
let modelsLoaded = false;
const loadModels = async (): Promise<void> => {
  if (modelsLoaded) return;

  await faceapi.nets.ssdMobilenetv1.loadFromDisk('models');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('models');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('models');

  modelsLoaded = true;
};

// Get similarity threshold from environment variable or use default
const similarityThreshold = parseFloat(
  process.env.FACE_SIMILARITY_THRESHOLD || '0.4',
);

const getFaceDescriptor = async (
  imagePath: string,
  dependencies: {
    logger: Logger;
  },
): Promise<faceapi.WithFaceDescriptor<
  faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
> | null> => {
  const { logger } = dependencies;
  await loadModels();

  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  logger.debug(`Getting face descriptor for ${imagePath}`);
  const detection = await faceapi
    .detectSingleFace(canvas as unknown as HTMLCanvasElement)
    .withFaceLandmarks()
    .withFaceDescriptor();
  logger.debug(`Face detection result for ${imagePath}:`, { detection });

  return detection || null;
};

export const findMatches = composable(
  async (
    request: FaceMatchRequest,
    dependencies: {
      logger: Logger;
    },
  ) => {
    const { albumName, facePath } = request;
    const { logger } = dependencies;
    const faceImagePath = path.join('storage', 'faces', facePath);
    const galleryPath = path.join('storage', 'gallery', albumName);

    // Get face descriptor for the target face
    logger.debug('Getting target face descriptor...');
    logger.debug('similarityThreshold: ', similarityThreshold);
    const targetFace = await getFaceDescriptor(faceImagePath, { logger });
    if (!targetFace) {
      logger.info('No face found in target image');
      return { matches: [] };
    }
    logger.debug('Target face descriptor:', {
      descriptor: targetFace.descriptor,
    });

    // Get all images from the gallery
    const files = await readdir(galleryPath, { withFileTypes: true });
    logger.debug('Raw files from readdir:', { files });
    const imageFiles = files.filter((file: Dirent) => {
      const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);
      logger.debug(`File ${file.name} is image: ${isImage}`);
      return isImage;
    });
    logger.debug('Filtered image files:', { imageFiles });

    // Process each gallery image
    const matches = [];
    for (const file of imageFiles) {
      const imagePath = path.join(galleryPath, file.name);
      logger.debug(`Processing gallery image: ${imagePath}`);

      try {
        const detection = await getFaceDescriptor(imagePath, { logger });
        if (!detection) {
          logger.info(`No face found in gallery image: ${imagePath}`);
          continue;
        }
        logger.debug(`Found face in gallery image: ${imagePath}`);

        // Calculate similarity
        const distance = faceapi.euclideanDistance(
          targetFace.descriptor,
          detection.descriptor,
        );
        const similarity = 1 - distance;
        logger.debug(`Similarity for ${imagePath}: ${similarity}`);

        // Only include matches above threshold
        if (similarity > similarityThreshold) {
          logger.info(`Adding match: ${imagePath} (similarity: ${similarity})`);
          matches.push({
            imagePath: path.relative(process.cwd(), imagePath),
            similarity,
            boundingBox: {
              x: detection.detection.box.x,
              y: detection.detection.box.y,
              width: detection.detection.box.width,
              height: detection.detection.box.height,
            },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          logger.warn(`Skipping ${file.name}: ${error.message}`);
        }
        continue;
      }
    }

    // Sort matches by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);
    logger.info('Final matches:', { matches });

    return {
      matches,
    };
  },
);

export const getAlbumImages = composable(
  async (request: AlbumImagesRequest, dependencies: { logger: Logger }) => {
    const { albumName } = request;
    const { logger } = dependencies;
    const galleryPath = path.join('storage', 'gallery', albumName);

    logger.debug('Getting images from album', { albumName });

    try {
      // Get all images from the gallery
      const files = await readdir(galleryPath, { withFileTypes: true });
      logger.debug('Raw files from readdir:', { files });

      const imageFiles = files.filter((file: Dirent) => {
        const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);
        logger.debug(`File ${file.name} is image: ${isImage}`);
        return isImage;
      });

      logger.debug('Filtered image files:', { imageFiles });

      // Map to relative paths
      const images = imageFiles.map((file) =>
        path.relative(process.cwd(), path.join(galleryPath, file.name)),
      );

      logger.info('Successfully retrieved album images', {
        count: images.length,
      });
      return { images };
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        logger.warn('Album not found', { albumName });
        return { images: [] };
      }
      throw error;
    }
  },
);
