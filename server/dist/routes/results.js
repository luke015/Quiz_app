import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
const RESULTS_FILENAME = 'results.json';
const PLAYERS_FILENAME = 'players.json';
// Public routes - Leaderboards and individual results
// GET leaderboard
router.get('/leaderboard', async (_req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        const players = await readJSONFile(PLAYERS_FILENAME);
        // Aggregate scores by player
        const playerScores = {};
        results.forEach((result) => {
            if (!playerScores[result.playerId]) {
                playerScores[result.playerId] = 0;
            }
            playerScores[result.playerId] += result.totalScore;
        });
        // Create leaderboard array with player names
        const leaderboard = Object.keys(playerScores).map((playerId) => {
            const player = players.find((p) => p.id === playerId);
            return {
                playerId,
                playerName: player ? player.name : 'Unknown Player',
                totalPoints: playerScores[playerId],
            };
        });
        // Sort by total points descending
        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        res.json(leaderboard);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to generate leaderboard' });
    }
});
// GET ranking-based leaderboard
router.get('/leaderboard/ranking', async (_req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        const players = await readJSONFile(PLAYERS_FILENAME);
        // Group results by quiz
        const resultsByQuiz = {};
        results.forEach((result) => {
            if (!resultsByQuiz[result.quizId]) {
                resultsByQuiz[result.quizId] = [];
            }
            resultsByQuiz[result.quizId].push(result);
        });
        // Calculate ranking points for each player
        const playerRankingPoints = {};
        Object.values(resultsByQuiz).forEach((quizResults) => {
            // Sort players by score in descending order
            const sortedResults = [...quizResults].sort((a, b) => b.totalScore - a.totalScore);
            const numPlayers = sortedResults.length;
            // Award points based on ranking
            sortedResults.forEach((result, index) => {
                const rankingPoints = numPlayers - index; // 1st place gets numPlayers points, 2nd gets numPlayers-1, etc.
                if (!playerRankingPoints[result.playerId]) {
                    playerRankingPoints[result.playerId] = 0;
                }
                playerRankingPoints[result.playerId] += rankingPoints;
            });
        });
        // Create leaderboard array with player names
        const leaderboard = Object.keys(playerRankingPoints).map((playerId) => {
            const player = players.find((p) => p.id === playerId);
            return {
                playerId,
                playerName: player ? player.name : 'Unknown Player',
                totalPoints: playerRankingPoints[playerId],
            };
        });
        // Sort by total ranking points descending
        leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        res.json(leaderboard);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to generate ranking leaderboard' });
    }
});
// GET results for a specific player (for individual results page)
router.get('/player/:playerId', async (req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        const playerResults = results.filter((r) => r.playerId === req.params.playerId);
        res.json(playerResults);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read results' });
    }
});
// GET all results (public - needed for individual results page)
router.get('/', async (_req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        res.json(results);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read results' });
    }
});
// Protected routes - require authentication
// GET results for a specific quiz
router.get('/quiz/:quizId', authenticateToken, async (req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        const quizResults = results.filter((r) => r.quizId === req.params.quizId);
        res.json(quizResults);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read results' });
    }
});
// POST create/update result
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { quizId, playerId, questionResults } = req.body;
        if (!quizId || !playerId || !questionResults) {
            return res.status(400).json({ error: 'quizId, playerId, and questionResults are required' });
        }
        const results = await readJSONFile(RESULTS_FILENAME);
        // Calculate total score
        const totalScore = questionResults.reduce((sum, qr) => sum + (qr.pointsAwarded || 0), 0);
        // Check if result already exists for this quiz and player
        const existingIndex = results.findIndex((r) => r.quizId === quizId && r.playerId === playerId);
        const result = {
            id: existingIndex !== -1 ? results[existingIndex].id : uuidv4(),
            quizId,
            playerId,
            questionResults,
            totalScore,
            completedAt: new Date().toISOString(),
        };
        if (existingIndex !== -1) {
            results[existingIndex] = result;
        }
        else {
            results.push(result);
        }
        await writeJSONFile(RESULTS_FILENAME, results);
        res.status(201).json(result);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to save result' });
    }
});
// DELETE result
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        const filteredResults = results.filter((r) => r.id !== req.params.id);
        if (results.length === filteredResults.length) {
            return res.status(404).json({ error: 'Result not found' });
        }
        await writeJSONFile(RESULTS_FILENAME, filteredResults);
        res.json({ message: 'Result deleted successfully' });
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to delete result' });
    }
});
export default router;
