import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
import { Result, Player, LeaderboardEntry } from '../types/index.js';

const router = express.Router();
const RESULTS_FILENAME = 'results.json';
const PLAYERS_FILENAME = 'players.json';

// GET all results
router.get('/', async (_req: Request, res: Response) => {
  try {
    const results = await readJSONFile<Result>(RESULTS_FILENAME);
    res.json(results);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read results' });
  }
});

// GET results for a specific quiz
router.get('/quiz/:quizId', async (req: Request, res: Response) => {
  try {
    const results = await readJSONFile<Result>(RESULTS_FILENAME);
    const quizResults = results.filter((r) => r.quizId === req.params.quizId);
    res.json(quizResults);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read results' });
  }
});

// GET results for a specific player
router.get('/player/:playerId', async (req: Request, res: Response) => {
  try {
    const results = await readJSONFile<Result>(RESULTS_FILENAME);
    const playerResults = results.filter((r) => r.playerId === req.params.playerId);
    res.json(playerResults);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read results' });
  }
});

// POST create/update result
router.post('/', async (req: Request, res: Response) => {
  try {
    const { quizId, playerId, questionResults } = req.body;

    if (!quizId || !playerId || !questionResults) {
      return res.status(400).json({ error: 'quizId, playerId, and questionResults are required' });
    }

    const results = await readJSONFile<Result>(RESULTS_FILENAME);

    // Calculate total score
    const totalScore = questionResults.reduce(
      (sum: number, qr: { pointsAwarded?: number }) => sum + (qr.pointsAwarded || 0),
      0
    );

    // Check if result already exists for this quiz and player
    const existingIndex = results.findIndex((r) => r.quizId === quizId && r.playerId === playerId);

    const result: Result = {
      id: existingIndex !== -1 ? results[existingIndex].id : uuidv4(),
      quizId,
      playerId,
      questionResults,
      totalScore,
      completedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      results[existingIndex] = result;
    } else {
      results.push(result);
    }

    await writeJSONFile<Result>(RESULTS_FILENAME, results);
    res.status(201).json(result);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// GET leaderboard
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const results = await readJSONFile<Result>(RESULTS_FILENAME);
    const players = await readJSONFile<Player>(PLAYERS_FILENAME);

    // Aggregate scores by player
    const playerScores: Record<string, number> = {};

    results.forEach((result) => {
      if (!playerScores[result.playerId]) {
        playerScores[result.playerId] = 0;
      }
      playerScores[result.playerId] += result.totalScore;
    });

    // Create leaderboard array with player names
    const leaderboard: LeaderboardEntry[] = Object.keys(playerScores).map((playerId) => {
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
  } catch (_error) {
    res.status(500).json({ error: 'Failed to generate leaderboard' });
  }
});

// GET ranking-based leaderboard
router.get('/leaderboard/ranking', async (_req: Request, res: Response) => {
  try {
    const results = await readJSONFile<Result>(RESULTS_FILENAME);
    const players = await readJSONFile<Player>(PLAYERS_FILENAME);

    // Group results by quiz
    const resultsByQuiz: Record<string, Result[]> = {};
    results.forEach((result) => {
      if (!resultsByQuiz[result.quizId]) {
        resultsByQuiz[result.quizId] = [];
      }
      resultsByQuiz[result.quizId].push(result);
    });

    // Calculate ranking points for each player
    const playerRankingPoints: Record<string, number> = {};

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
    const leaderboard: LeaderboardEntry[] = Object.keys(playerRankingPoints).map((playerId) => {
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
  } catch (_error) {
    res.status(500).json({ error: 'Failed to generate ranking leaderboard' });
  }
});

// DELETE result
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const results = await readJSONFile<Result>(RESULTS_FILENAME);
    const filteredResults = results.filter((r) => r.id !== req.params.id);

    if (results.length === filteredResults.length) {
      return res.status(404).json({ error: 'Result not found' });
    }

    await writeJSONFile<Result>(RESULTS_FILENAME, filteredResults);
    res.json({ message: 'Result deleted successfully' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

export default router;
