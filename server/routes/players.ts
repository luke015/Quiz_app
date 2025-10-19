import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSONFile, writeJSONFile } from '../utils/fileManager.js';
import { Player } from '../types/index.js';

const router = express.Router();
const FILENAME = 'players.json';

// GET all players
router.get('/', async (_req: Request, res: Response) => {
  try {
    const players = await readJSONFile<Player>(FILENAME);
    res.json(players);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read players' });
  }
});

// GET single player
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const players = await readJSONFile<Player>(FILENAME);
    const player = players.find((p) => p.id === req.params.id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to read player' });
  }
});

// POST create player
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const players = await readJSONFile<Player>(FILENAME);

    const newPlayer: Player = {
      id: uuidv4(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    players.push(newPlayer);
    await writeJSONFile<Player>(FILENAME, players);

    res.status(201).json(newPlayer);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PUT update player
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const players = await readJSONFile<Player>(FILENAME);
    const index = players.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Player not found' });
    }

    players[index] = {
      ...players[index],
      name: name.trim(),
    };

    await writeJSONFile<Player>(FILENAME, players);
    res.json(players[index]);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE player
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const players = await readJSONFile<Player>(FILENAME);
    const filteredPlayers = players.filter((p) => p.id !== req.params.id);

    if (players.length === filteredPlayers.length) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await writeJSONFile<Player>(FILENAME, filteredPlayers);
    res.json({ message: 'Player deleted successfully' });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

export default router;
