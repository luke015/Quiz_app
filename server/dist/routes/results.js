import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
const router = express.Router();
const RESULTS_FILENAME = 'results.json';
const PLAYERS_FILENAME = 'players.json';
// GET all results
router.get('/', async (_req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        res.json(results);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read results' });
    }
});
// GET results for a specific quiz
router.get('/quiz/:quizId', async (req, res) => {
    try {
        const results = await readJSONFile(RESULTS_FILENAME);
        const quizResults = results.filter((r) => r.quizId === req.params.quizId);
        res.json(quizResults);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read results' });
    }
});
// GET results for a specific player
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
// POST create/update result
router.post('/', async (req, res) => {
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
// DELETE result
router.delete('/:id', async (req, res) => {
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
