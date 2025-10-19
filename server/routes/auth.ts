import { Router, Request, Response } from 'express';
import { sessionManager } from '../utils/sessionManager.js';

const router = Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    // Create a new session with a hashed token
    const token = await sessionManager.createSession(password);
    return res.json({ token, message: 'Login successful' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid password' });
  }
});

// Verify token endpoint
router.post('/verify', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  try {
    const isValid = await sessionManager.verifyToken(token);
    return res.json({ valid: isValid });
  } catch (error) {
    return res.status(500).json({ valid: false });
  }
});

// Logout endpoint
router.post('/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    await sessionManager.removeSession(token);
  }

  return res.json({ message: 'Logged out successfully' });
});

export default router;

