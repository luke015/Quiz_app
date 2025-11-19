import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
import { Quiz, Question } from '../types/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeQuiz, sanitizeQuizzes } from '../utils/quizSanitizer.js';
import { sessionManager } from '../utils/sessionManager.js';

const router = express.Router();
const FILENAME = 'quizzes.json';

// Helper function to check if request is authenticated
const isAuthenticated = async (req: Request): Promise<boolean> => {
  const token = req.cookies.authToken;

  if (!token) {
    return false;
  }

  try {
    return await sessionManager.verifyToken(token);
  } catch {
    return false;
  }
};

// Public routes - GET endpoints (with answers stripped for non-authenticated users)
// GET all quizzes
router.get('/', async (req: Request, res: Response) => {
  try {
    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const authenticated = await isAuthenticated(req);

    // Return quizzes without answers for unauthenticated users
    const responseQuizzes = authenticated ? quizzes : sanitizeQuizzes(quizzes);
    res.json(responseQuizzes);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read quizzes' });
  }
});

// GET single quiz
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const quiz = quizzes.find((q) => q.id === req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const authenticated = await isAuthenticated(req);

    // Return quiz without answers for unauthenticated users
    const responseQuiz = authenticated ? quiz : sanitizeQuiz(quiz);
    res.json(responseQuiz);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read quiz' });
  }
});

// Protected routes - require authentication
// POST create quiz
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Quiz title is required' });
    }

    const quizzes = await readJSONFile<Quiz>(FILENAME);

    const newQuiz: Quiz = {
      id: uuidv4(),
      title: title.trim(),
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
      questions: [],
    };

    quizzes.push(newQuiz);
    await writeJSONFile<Quiz>(FILENAME, quizzes);

    res.status(201).json(newQuiz);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// PUT update quiz
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Quiz title is required' });
    }

    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const index = quizzes.findIndex((q) => q.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    quizzes[index] = {
      ...quizzes[index],
      title: title.trim(),
      description: description?.trim() || '',
    };

    await writeJSONFile<Quiz>(FILENAME, quizzes);
    res.json(quizzes[index]);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// DELETE quiz
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const filteredQuizzes = quizzes.filter((q) => q.id !== req.params.id);

    if (quizzes.length === filteredQuizzes.length) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    await writeJSONFile<Quiz>(FILENAME, filteredQuizzes);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// POST add question to quiz
router.post('/:id/questions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { questionText, type, mediaType, mediaPath, maxPoints, options, correctAnswer } = req.body;

    if (!questionText || questionText.trim() === '') {
      return res.status(400).json({ error: 'Question text is required' });
    }

    if (!type || !['text', 'multiple-choice'].includes(type)) {
      return res.status(400).json({ error: 'Invalid question type' });
    }

    if (!maxPoints || maxPoints < 0) {
      return res.status(400).json({ error: 'Max points must be a positive number' });
    }

    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const quiz = quizzes.find((q) => q.id === req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const newQuestion: Question = {
      id: uuidv4(),
      type,
      questionText: questionText.trim(),
      mediaType: mediaType || 'none',
      mediaPath: mediaPath || null,
      maxPoints: Number(maxPoints),
      options: type === 'multiple-choice' ? options || [] : [],
      correctAnswer: correctAnswer || '',
    };

    quiz.questions.push(newQuestion);
    await writeJSONFile<Quiz>(FILENAME, quizzes);

    res.status(201).json(newQuestion);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// PUT update question
router.put('/:quizId/questions/:questionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { questionText, type, mediaType, mediaPath, maxPoints, options, correctAnswer } = req.body;

    if (!questionText || questionText.trim() === '') {
      return res.status(400).json({ error: 'Question text is required' });
    }

    if (!type || !['text', 'multiple-choice'].includes(type)) {
      return res.status(400).json({ error: 'Invalid question type' });
    }

    if (!maxPoints || maxPoints < 0) {
      return res.status(400).json({ error: 'Max points must be a positive number' });
    }

    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const quiz = quizzes.find((q) => q.id === req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questionIndex = quiz.questions.findIndex((q) => q.id === req.params.questionId);

    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    quiz.questions[questionIndex] = {
      ...quiz.questions[questionIndex],
      type,
      questionText: questionText.trim(),
      mediaType: mediaType || 'none',
      mediaPath: mediaPath || null,
      maxPoints: Number(maxPoints),
      options: type === 'multiple-choice' ? options || [] : [],
      correctAnswer: correctAnswer || '',
    };

    await writeJSONFile<Quiz>(FILENAME, quizzes);
    res.json(quiz.questions[questionIndex]);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE question
router.delete('/:quizId/questions/:questionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const quizzes = await readJSONFile<Quiz>(FILENAME);
    const quiz = quizzes.find((q) => q.id === req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const originalLength = quiz.questions.length;
    quiz.questions = quiz.questions.filter((q) => q.id !== req.params.questionId);

    if (originalLength === quiz.questions.length) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await writeJSONFile<Quiz>(FILENAME, quizzes);
    res.json({ message: 'Question deleted successfully' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
