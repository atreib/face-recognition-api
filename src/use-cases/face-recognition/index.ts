import * as faceapi from 'face-api.js';
import { createCanvas, loadImage, Canvas, Image, ImageData } from 'canvas';
import { composable } from 'composable-functions';
import { readdir } from 'fs/promises';
import { Dirent } from 'fs';
import path from 'path';
import { FaceMatchRequest } from '../../types/face-recognition';

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
): Promise<faceapi.WithFaceDescriptor<
  faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
> | null> => {
  await loadModels();

  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  console.log(`Getting face descriptor for ${imagePath}`);
  const detection = await faceapi
    .detectSingleFace(canvas as unknown as HTMLCanvasElement)
    .withFaceLandmarks()
    .withFaceDescriptor();
  console.log(`Face detection result for ${imagePath}:`, detection);

  return detection || null;
};

export const findMatches = composable(async (request: FaceMatchRequest) => {
  const { albumName, facePath } = request;
  const faceImagePath = path.join('storage', 'faces', facePath);
  const galleryPath = path.join('storage', 'gallery', albumName);

  // Get face descriptor for the target face
  console.log('Getting target face descriptor...');
  console.log('similarityThreshold: ', similarityThreshold);
  const targetFace = await getFaceDescriptor(faceImagePath);
  if (!targetFace) {
    console.log('No face found in target image');
    return { matches: [] };
  }
  console.log('Target face descriptor:', targetFace.descriptor);

  // Get all images from the gallery
  const files = await readdir(galleryPath, { withFileTypes: true });
  console.log('Raw files from readdir:', files);
  const imageFiles = files.filter((file: Dirent) => {
    const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);
    console.log(`File ${file.name} is image: ${isImage}`);
    return isImage;
  });
  console.log('Filtered image files:', imageFiles);

  // Process each gallery image
  const matches = [];
  for (const file of imageFiles) {
    const imagePath = path.join(galleryPath, file.name);
    console.log(`Processing gallery image: ${imagePath}`);

    try {
      const detection = await getFaceDescriptor(imagePath);
      if (!detection) {
        console.log(`No face found in gallery image: ${imagePath}`);
        continue;
      }
      console.log(`Found face in gallery image: ${imagePath}`);

      // Calculate similarity
      const distance = faceapi.euclideanDistance(
        targetFace.descriptor,
        detection.descriptor,
      );
      const similarity = 1 - distance;
      console.log(`Similarity for ${imagePath}: ${similarity}`);

      // Only include matches above threshold
      if (similarity > similarityThreshold) {
        console.log(`Adding match: ${imagePath} (similarity: ${similarity})`);
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
        console.warn(`Skipping ${file.name}: ${error.message}`);
      }
      continue;
    }
  }

  // Sort matches by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);
  console.log('Final matches:', matches);

  return {
    matches,
  };
});
