import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { loggerMiddleware } from './middleware/logger';
import healthRouter from './routes/health';
import faceRecognitionRouter from './routes/face-recognition';

const app = express();

app.use(express.json());
app.use(loggerMiddleware);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/health', healthRouter);
app.use('/face-recognition', faceRecognitionRouter);

export default app;
