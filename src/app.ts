import express from 'express';
import healthRoutes from './routes/health';
import faceRecognitionRouter from './routes/face-recognition';

const app = express();

app.use(express.json());
app.use('/health', healthRoutes);
app.use('/face-recognition', faceRecognitionRouter);

export default app;
