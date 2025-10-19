import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import quizzesRouter from './routes/quizzes.js';
import playersRouter from './routes/players.js';
import resultsRouter from './routes/results.js';
import uploadRouter from './routes/upload.js';
import authRouter from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
