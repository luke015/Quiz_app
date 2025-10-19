import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
import { authenticateToken } from '../middleware/auth.js';
import { sanitizeQuiz, sanitizeQuizzes } from '../utils/quizSanitizer.js';
import { sessionManager } from '../utils/sessionManager.js';
const router = express.Router();
const FILENAME = 'quizzes.json';
// Helper function to check if request is authenticated
const isAuthenticated = async (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return false;
    }
    try {
        return await sessionManager.verifyToken(token);
    }
    catch {
        return false;
    }
};
// Public routes - GET endpoints (with answers stripped for non-authenticated users)
// GET all quizzes
router.get('/', async (req, res) => {
    try {
        const quizzes = await readJSONFile(FILENAME);
        const authenticated = await isAuthenticated(req);
        // Return quizzes without answers for unauthenticated users
        const responseQuizzes = authenticated ? quizzes : sanitizeQuizzes(quizzes);
        res.json(responseQuizzes);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read quizzes' });
    }
});
// GET single quiz
router.get('/:id', async (req, res) => {
    try {
        const quizzes = await readJSONFile(FILENAME);
        const quiz = quizzes.find((q) => q.id === req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        const authenticated = await isAuthenticated(req);
        // Return quiz without answers for unauthenticated users
        const responseQuiz = authenticated ? quiz : sanitizeQuiz(quiz);
        res.json(responseQuiz);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read quiz' });
    }
});
// Protected routes - require authentication
// POST create quiz
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Quiz title is required' });
        }
        const quizzes = await readJSONFile(FILENAME);
        const newQuiz = {
            id: uuidv4(),
            title: title.trim(),
            description: description?.trim() || '',
            createdAt: new Date().toISOString(),
            questions: [],
        };
        quizzes.push(newQuiz);
        await writeJSONFile(FILENAME, quizzes);
        res.status(201).json(newQuiz);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});
// PUT update quiz
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Quiz title is required' });
        }
        const quizzes = await readJSONFile(FILENAME);
        const index = quizzes.findIndex((q) => q.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        quizzes[index] = {
            ...quizzes[index],
            title: title.trim(),
            description: description?.trim() || '',
        };
        await writeJSONFile(FILENAME, quizzes);
        res.json(quizzes[index]);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to update quiz' });
    }
});
// DELETE quiz
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const quizzes = await readJSONFile(FILENAME);
        const filteredQuizzes = quizzes.filter((q) => q.id !== req.params.id);
        if (quizzes.length === filteredQuizzes.length) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        await writeJSONFile(FILENAME, filteredQuizzes);
        res.json({ message: 'Quiz deleted successfully' });
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});
// POST add question to quiz
router.post('/:id/questions', authenticateToken, async (req, res) => {
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
        const quizzes = await readJSONFile(FILENAME);
        const quiz = quizzes.find((q) => q.id === req.params.id);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        const newQuestion = {
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
        await writeJSONFile(FILENAME, quizzes);
        res.status(201).json(newQuestion);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to add question' });
    }
});
// PUT update question
router.put('/:quizId/questions/:questionId', authenticateToken, async (req, res) => {
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
        const quizzes = await readJSONFile(FILENAME);
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
        await writeJSONFile(FILENAME, quizzes);
        res.json(quiz.questions[questionIndex]);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to update question' });
    }
});
// DELETE question
router.delete('/:quizId/questions/:questionId', authenticateToken, async (req, res) => {
    try {
        const quizzes = await readJSONFile(FILENAME);
        const quiz = quizzes.find((q) => q.id === req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        const originalLength = quiz.questions.length;
        quiz.questions = quiz.questions.filter((q) => q.id !== req.params.questionId);
        if (originalLength === quiz.questions.length) {
            return res.status(404).json({ error: 'Question not found' });
        }
        await writeJSONFile(FILENAME, quizzes);
        res.json({ message: 'Question deleted successfully' });
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to delete question' });
    }
});
export default router;
