import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findMatches } from '.';
import * as faceapi from 'face-api.js';
import fs from 'fs/promises';
import { Dirent } from 'fs';
import { success } from 'composable-functions';
import { Logger } from '../../lib/logger';

// Create a mock logger for testing
const createMockLogger = (): Pick<
  Logger,
  'debug' | 'info' | 'warn' | 'error'
> => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
});

// Mock dependencies
vi.mock('face-api.js', () => ({
  env: {
    monkeyPatch: vi.fn(),
  },
  nets: {
    ssdMobilenetv1: {
      loadFromDisk: vi.fn(),
    },
    faceLandmark68Net: {
      loadFromDisk: vi.fn(),
    },
    faceRecognitionNet: {
      loadFromDisk: vi.fn(),
    },
  },
  detectSingleFace: vi.fn(),
  euclideanDistance: vi.fn(),
}));

// Mock canvas with all required exports
vi.mock('canvas', () => {
  const mockContext = {
    drawImage: vi.fn(),
  };

  const mockCanvas = {
    getContext: vi.fn(() => mockContext),
    width: 800,
    height: 600,
  };

  return {
    createCanvas: vi.fn(() => mockCanvas),
    loadImage: vi.fn(() => ({
      width: 800,
      height: 600,
    })),
    Canvas: class {
      getContext(): typeof mockContext {
        return mockContext;
      }
    },
    Image: class {},
    ImageData: class {},
  };
});

vi.mock('fs/promises');

describe('Face Recognition Use Case', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = createMockLogger();
  });

  it('should return empty matches when no faces are found', async () => {
    // Mock file system
    const mockDirents = [
      { name: 'image1.jpg', isFile: () => true } as Dirent,
      { name: 'image2.jpg', isFile: () => true } as Dirent,
    ];
    vi.mocked(fs.readdir).mockResolvedValue(mockDirents);

    // Mock face detection to return null (no face found)
    const mockDetectSingleFace = {
      withFaceLandmarks: vi.fn().mockReturnThis(),
      withFaceDescriptor: vi.fn().mockResolvedValue(null),
    };
    vi.mocked(faceapi.detectSingleFace).mockReturnValue(
      mockDetectSingleFace as unknown as ReturnType<
        typeof faceapi.detectSingleFace
      >,
    );

    const result = await findMatches(
      {
        albumName: 'test-album',
        facePath: 'test-face.jpg',
      },
      { logger: mockLogger as unknown as Logger },
    );

    expect(result).toEqual(success({ matches: [] }));
    expect(mockLogger.info).toHaveBeenCalledWith(
      'No face found in target image',
    );
  });

  it('should return matches when faces are found', async () => {
    // Mock file system first
    vi.mocked(fs.readdir).mockResolvedValue([
      { name: 'image1.jpg', isFile: () => true } as Dirent,
    ]);

    // Mock face detection with successful matches
    const mockDetection = {
      descriptor: new Float32Array(128),
      detection: {
        box: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      },
      landmarks: {},
    };

    // Create a mock that always returns a successful detection
    const mockWithFaceDescriptor = vi.fn().mockResolvedValue(mockDetection);
    const mockWithFaceLandmarks = vi
      .fn()
      .mockReturnValue({ withFaceDescriptor: mockWithFaceDescriptor });
    const mockDetectSingleFace = { withFaceLandmarks: mockWithFaceLandmarks };

    // Mock detectSingleFace to always return the same mock
    vi.mocked(faceapi.detectSingleFace).mockImplementation(() => {
      mockLogger.debug('Face detection started');
      return mockDetectSingleFace as unknown as ReturnType<
        typeof faceapi.detectSingleFace
      >;
    });

    // Mock distance calculation to return a good match
    vi.mocked(faceapi.euclideanDistance).mockImplementation((desc1, desc2) => {
      mockLogger.debug('Calculating face similarity', { desc1, desc2 });
      return 0.3; // 1 - 0.3 = 0.7 similarity
    });

    const result = await findMatches(
      {
        albumName: 'test-album',
        facePath: 'test-face.jpg',
      },
      { logger: mockLogger as unknown as Logger },
    );

    mockLogger.info('Test completed', { result });

    expect(result).toEqual(
      success({
        matches: [
          {
            imagePath: expect.stringContaining('image1.jpg'),
            similarity: 0.7,
            boundingBox: {
              x: 0,
              y: 0,
              width: 100,
              height: 100,
            },
          },
        ],
      }),
    );

    // Verify that the mocks were called correctly
    expect(faceapi.detectSingleFace).toHaveBeenCalledTimes(2); // Once for target face, once for gallery image
    expect(mockWithFaceLandmarks).toHaveBeenCalledTimes(2);
    expect(mockWithFaceDescriptor).toHaveBeenCalledTimes(2);
    expect(faceapi.euclideanDistance).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith('Test completed', { result });
  });
});
