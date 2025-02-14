# Face Recognition API

A RESTful API for face recognition built with Node.js, TypeScript, and Express.

## Features

- TypeScript for type safety
- Express for routing
- Zod for runtime type validation
- Composable functions for functional programming
- Jest + Supertest for integration testing
- Vitest for unit testing
- ESLint + Prettier for code quality
- Husky for Git hooks

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 7 or higher

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/face-recognition-api.git
cd face-recognition-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
cp .env.sample .env
```

### Development

Start the development server:

```bash
npm run dev
```

### Testing

Run unit tests:

```bash
npm test
```

Run integration tests:

```bash
npm run test:integration
```

### Building

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Documentation

### Health Check

```http
GET /health
```

Returns the health status of the API.

#### Response

```json
{
  "status": "ok",
  "timestamp": "2025-02-14T00:21:33.769Z"
}
```

## Project Structure

```
src/
├── functions/     # Pure functions and business logic
├── routes/        # Express route handlers
├── types/         # TypeScript type definitions
├── app.ts         # Express app setup
└── index.ts       # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
