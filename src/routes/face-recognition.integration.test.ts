import request from 'supertest';
import app from '../app';
import fs from 'fs/promises';
import path from 'path';

describe('Face Recognition API', () => {
  const testFacePath = 'test-face.jpg';
  const testAlbumName = 'test-album';
  const testAlbumPath = path.join('storage', 'gallery', testAlbumName);
  const testFaceStoragePath = path.join('storage', 'faces', testFacePath);

  beforeAll(async () => {
    // Create test directories
    await fs.mkdir(path.join('storage', 'faces'), { recursive: true });
    await fs.mkdir(testAlbumPath, { recursive: true });

    // Copy test images (you'll need to provide these)
    // await fs.copyFile(
    //   path.join('test', 'fixtures', 'face.jpg'),
    //   testFaceStoragePath
    // )
    // await fs.copyFile(
    //   path.join('test', 'fixtures', 'gallery-1.jpg'),
    //   path.join(testAlbumPath, 'image1.jpg')
    // )
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.unlink(testFaceStoragePath);
      await fs.rm(testAlbumPath, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('POST /face-recognition/match', () => {
    it('should return 400 if request body is invalid', async () => {
      const response = await request(app)
        .post('/face-recognition/match')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    // Uncomment when you have test images
    // it('should find matching faces in the album', async () => {
    //   const response = await request(app)
    //     .post('/face-recognition/match')
    //     .send({
    //       albumName: testAlbumName,
    //       facePath: testFacePath,
    //     })

    //   expect(response.status).toBe(200)
    //   expect(response.body).toHaveProperty('matches')
    //   expect(Array.isArray(response.body.matches)).toBe(true)

    //   // If there are matches, verify their structure
    //   if (response.body.matches.length > 0) {
    //     const match = response.body.matches[0]
    //     expect(match).toHaveProperty('imagePath')
    //     expect(match).toHaveProperty('similarity')
    //     expect(match).toHaveProperty('boundingBox')
    //     expect(match.similarity).toBeGreaterThan(0.6)
    //   }
    // })
  });

  describe('GET /face-recognition/album/:albumName/images', () => {
    it('should return empty array for non-existent album', async () => {
      const response = await request(app)
        .get('/face-recognition/album/non-existent-album/images')
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ images: [] });
    });

    it('should return array of image paths for existing album', async () => {
      // Create test image in the album
      const testImagePath = path.join(testAlbumPath, 'test-image.jpg');
      await fs.writeFile(testImagePath, 'dummy image content');

      const response = await request(app)
        .get(`/face-recognition/album/${testAlbumName}/images`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('images');
      expect(Array.isArray(response.body.images)).toBe(true);
      expect(response.body.images).toContain(
        path.join('storage', 'gallery', testAlbumName, 'test-image.jpg'),
      );

      // Clean up test image
      await fs.unlink(testImagePath);
    });
  });

  describe('GET /face-recognition/image/:imagePath', () => {
    const testImagePath = path.join('storage', 'faces', 'test-image.jpg');

    beforeAll(async () => {
      // Create test image
      await fs.mkdir(path.dirname(testImagePath), { recursive: true });
      await fs.writeFile(testImagePath, 'dummy image content');
    });

    afterAll(async () => {
      // Clean up test image
      try {
        await fs.unlink(testImagePath);
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should return 400 for paths outside storage directory', async () => {
      const response = await request(app)
        .get('/face-recognition/image/../outside-storage.jpg')
        .send();

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid image path');
    });

    it('should return 404 for non-existent images', async () => {
      const response = await request(app)
        .get('/face-recognition/image/storage/faces/non-existent.jpg')
        .send();

      expect(response.status).toBe(404);
    });

    it('should serve existing images', async () => {
      const response = await request(app)
        .get(`/face-recognition/image/${testImagePath}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.type).toBe('image/jpeg');
      expect(response.body).toBeDefined();
    });
  });
});
