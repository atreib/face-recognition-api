import express from 'express';
import healthRoutes from './routes/health.js';

const app = express();

app.use(express.json());
app.use('/health', healthRoutes);

export default app;
