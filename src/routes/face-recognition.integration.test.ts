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
});
