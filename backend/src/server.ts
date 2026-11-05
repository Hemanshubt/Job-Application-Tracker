import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { authenticateUser } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

import applicationRoutes from './routes/applicationRoutes';
import interviewRoutes from './routes/interviewRoutes';
import recruiterRoutes from './routes/recruiterRoutes';
import taskRoutes from './routes/taskRoutes';
import noteRoutes from './routes/noteRoutes';
import activityRoutes from './routes/activityRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import profileRoutes from './routes/profileRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const production = process.env.NODE_ENV === 'production';
const CLIENT_URL = process.env.CLIENT_URL || (production ? '' : 'http://localhost:5173');
if (production && (!CLIENT_URL || !CLIENT_URL.startsWith('https://'))) {
  throw new Error('Production CLIENT_URL must be an HTTPS origin.');
}

// Security and utility middleware
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(
  cors({
    origin: production
      ? [CLIENT_URL]
      : [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(morgan(production ? 'combined' : 'dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Job Tracker Backend API',
    uptime: process.uptime(),
  });
});

// Protected API routes
app.use('/api/applications', authenticateUser, applicationRoutes);
app.use('/api/interviews', authenticateUser, interviewRoutes);
app.use('/api/recruiters', authenticateUser, recruiterRoutes);
app.use('/api/tasks', authenticateUser, taskRoutes);
app.use('/api/notes', authenticateUser, noteRoutes);
app.use('/api/activity', authenticateUser, activityRoutes);
app.use('/api/analytics', authenticateUser, analyticsRoutes);
app.use('/api/profile', authenticateUser, profileRoutes);

// 404 Fallback for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Job Tracker Backend API is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
});

export default app;
