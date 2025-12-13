import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs/promises';
import quizzesRouter from './routes/quizzes.js';
import playersRouter from './routes/players.js';
import resultsRouter from './routes/results.js';
import uploadRouter from './routes/upload.js';
import authRouter from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';
import { DATA_DIR } from './utils/fileManager.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Get uploads directory path from environment variable, fallback to uploads folder in current working directory
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');

// Ensure data and uploads directories exist at startup
const ensureDirectories = async (): Promise<void> => {
  try {
    // Ensure data directory exists
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log(`Created data directory: ${DATA_DIR}`);
    }

    // Ensure uploads directory exists
    try {
      await fs.access(UPLOADS_DIR);
    } catch {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      console.log(`Created uploads directory: ${UPLOADS_DIR}`);
    }
  } catch (error) {
    console.error('Failed to ensure directories:', error);
    throw new Error(`Cannot create required directories: ${(error as Error).message}`);
  }
};

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development, configure for production
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(UPLOADS_DIR));

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/results', resultsRouter); // Has mixed public/protected routes
app.use('/api/quizzes', quizzesRouter); // Has mixed public/protected routes (GET is public)
app.use('/api/players', playersRouter); // Has mixed public/protected routes (GET is public)

// Protected routes (require authentication)
app.use('/api/upload', authenticateToken, uploadRouter);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Global error handler middleware (must be last)
app.use((err: Error, req: Request, res: Response, _: NextFunction) => {
  console.error('Unhandled error:', err);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  const isDevelopment = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: 'Internal server error',
    ...(isDevelopment && {
      details: err.message,
      stack: err.stack
    })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server after ensuring directories exist
ensureDirectories()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Data directory: ${DATA_DIR}`);
      console.log(`Uploads directory: ${UPLOADS_DIR}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
