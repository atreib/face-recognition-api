import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Face Recognition API',
      version: '1.0.0',
      description: 'API for face recognition and matching in image albums',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      schemas: {
        FaceMatchRequest: {
          type: 'object',
          required: ['albumName', 'imagePath'],
          properties: {
            albumName: {
              type: 'string',
              description: 'Name of the album to search in',
            },
            imagePath: {
              type: 'string',
              description: 'Path to the target face image',
            },
          },
        },
        FaceMatchResponse: {
          type: 'object',
          properties: {
            matches: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  imagePath: {
                    type: 'string',
                    description: 'Path to the matched image',
                  },
                  similarity: {
                    type: 'number',
                    description: 'Similarity score (0-1)',
                  },
                },
              },
            },
          },
        },
        AlbumImagesRequest: {
          type: 'object',
          required: ['albumName'],
          properties: {
            albumName: {
              type: 'string',
              description: 'Name of the album to get images from',
            },
          },
        },
        AlbumImagesResponse: {
          type: 'object',
          properties: {
            images: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Path to an image in the album',
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    description: 'Error message',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
