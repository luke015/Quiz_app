import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
const FILENAME = 'players.json';
// Public routes - GET endpoints
// GET all players
router.get('/', async (_req, res) => {
    try {
        const players = await readJSONFile(FILENAME);
        res.json(players);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read players' });
    }
});
// GET single player
router.get('/:id', async (req, res) => {
    try {
        const players = await readJSONFile(FILENAME);
        const player = players.find((p) => p.id === req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to read player' });
    }
});
// Protected routes - require authentication
// POST create player
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Player name is required' });
        }
        const players = await readJSONFile(FILENAME);
        const newPlayer = {
            id: uuidv4(),
            name: name.trim(),
            createdAt: new Date().toISOString(),
        };
        players.push(newPlayer);
        await writeJSONFile(FILENAME, players);
        res.status(201).json(newPlayer);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to create player' });
    }
});
// PUT update player
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Player name is required' });
        }
        const players = await readJSONFile(FILENAME);
        const index = players.findIndex((p) => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Player not found' });
        }
        players[index] = {
            ...players[index],
            name: name.trim(),
        };
        await writeJSONFile(FILENAME, players);
        res.json(players[index]);
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to update player' });
    }
});
// DELETE player
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const players = await readJSONFile(FILENAME);
        const filteredPlayers = players.filter((p) => p.id !== req.params.id);
        if (players.length === filteredPlayers.length) {
            return res.status(404).json({ error: 'Player not found' });
        }
        await writeJSONFile(FILENAME, filteredPlayers);
        res.json({ message: 'Player deleted successfully' });
    }
    catch (_error) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
});
export default router;
