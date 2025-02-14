# Face Recognition API

A REST API for face recognition in images using face-api.js.

## Features

- Face detection and recognition using face-api.js
- Search for matching faces in image albums
- Type-safe API with Zod validation
- Composable and testable architecture
- Integration and unit tests

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/face-recognition-api.git
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

## API Endpoints

### POST /face-recognition/match

Search for matching faces in an album.

**Request Body:**

```json
{
  "albumName": "my-album",
  "facePath": "person.jpg"
}
```

**Response:**

```json
{
  "matches": [
    {
      "imagePath": "storage/gallery/my-album/photo1.jpg",
      "similarity": 0.92,
      "boundingBox": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 200
      }
    }
  ]
}
```

## Project Structure

- `src/` - Source code
  - `types/` - TypeScript types and Zod schemas
  - `routes/` - Express route handlers
  - `use-cases/` - Business logic
  - `middleware/` - Express middleware
- `storage/` - Image storage
  - `faces/` - Face images to search for
  - `gallery/` - Albums of images to search through
- `models/` - face-api.js model files
- `scripts/` - Setup and utility scripts

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Create a pull request

## License

MIT
