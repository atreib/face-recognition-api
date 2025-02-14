# Face Recognition API

A REST API for face recognition in images using face-api.js, built with TypeScript and Express.js. This API allows you to perform face detection and recognition within collections of images, organized in albums.

## Features

- Face detection and recognition using face-api.js with TensorFlow.js
- Album-based image organization and search
- Similarity scoring (0-1) for face matches
- Bounding box information for detected faces
- Direct image serving capabilities
- Health check endpoint for monitoring
- Interactive API documentation with Swagger/OpenAPI
- Type-safe API with Zod validation
- Composable and testable architecture using composable-functions
- Comprehensive logging system
- Integration and unit tests with Jest, Supertest, and Vitest

## Technical Stack

- **Language:** TypeScript
- **Framework:** Express.js
- **Face Recognition:** face-api.js (TensorFlow.js-based)
- **Image Processing:** Node.js Canvas API
- **Type Validation:** Zod
- **Function Composition:** composable-functions
- **Testing:**
  - Unit Tests: Vitest
  - Integration Tests: Jest + Supertest
- **Documentation:** Swagger/OpenAPI (swagger-jsdoc + swagger-ui-express)
- **Code Quality:**
  - Prettier for formatting
  - ESLint for linting
- **Environment:** dotenv for configuration

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone https://github.com/atreib/face-recognition-api.git
cd face-recognition-api
```

2. Install dependencies:

```bash
npm install
```

3. Run the setup script to download face-api.js models and create necessary directories:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

4. Create a `.env` file:

```bash
cp .env.sample .env
```

5. Add your face images:

- Put face images to search for in `storage/faces/`
- Create albums in `storage/gallery/`
- Add pictures to search through in `storage/gallery/<album-name>/`

## Development

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run linter:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## API Documentation

The API is documented using Swagger/OpenAPI. After starting the development server, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

This interactive documentation allows you to:

- Browse all available endpoints
- See detailed request/response schemas
- Test the API directly from your browser
- View example requests and responses
- Understand authentication requirements
- Download OpenAPI specification

For a quick overview, the API provides endpoints for:

- Face matching in albums
- Album image listing
- Direct image serving
- Health checking

## Project Structure

- `src/` - Source code
  - `config/` - Configuration files (Swagger setup)
  - `types/` - TypeScript types and Zod schemas
  - `routes/` - Express route handlers
  - `use-cases/` - Business logic
  - `middleware/` - Express middleware
  - `lib/` - Reusable utilities (logger, etc.)
- `storage/` - Image storage
  - `faces/` - Face images to search for
  - `gallery/` - Albums of images to search through
- `models/` - face-api.js model files
- `scripts/` - Setup and utility scripts

## Development Practices

- **Type Safety:** Extensive use of TypeScript and Zod
- **Functional Programming:** Using composable-functions for modularity
- **Testing:** Comprehensive unit and integration tests
- **Code Style:** Enforced by Prettier and ESLint
- **Documentation:** Auto-generated Swagger/OpenAPI docs
- **Version Control:** Git with atomic commits and meaningful messages
- **Environment Variables:** Configuration through .env files

## Error Handling

The API includes comprehensive error handling:

- 400 for invalid requests (validation failures, missing files)
- 404 for resources not found
- 500 for internal server errors

## Future Improvements

- Enhanced error handling with specific error codes
- Scalability improvements for large albums
- User authentication and authorization
- Direct image upload API endpoints
- Asynchronous operations for intensive tasks
- Periodic model updates mechanism

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request
