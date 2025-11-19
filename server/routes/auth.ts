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

    // Set token as httpOnly cookie with 24 hour expiration
    res.cookie('authToken', token, {
      httpOnly: true, // Prevents JavaScript access
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      // maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      maxAge: 60 * 1000 // 24 hours in milliseconds
    });

    return res.json({ message: 'Login successful' });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid password' });
  }
});

// Verify token endpoint
router.post('/verify', async (req: Request, res: Response) => {
  const token = req.cookies.authToken;

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
  const token = req.cookies.authToken;

  if (token) {
    await sessionManager.removeSession(token);
  }

  // Clear the cookie
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res.json({ message: 'Logged out successfully' });
});

export default router;

