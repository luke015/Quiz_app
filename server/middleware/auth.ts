import { Request, Response, NextFunction } from 'express';
import { sessionManager } from '../utils/sessionManager.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const isValid = await sessionManager.verifyToken(token);
    
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication verification failed' });
  }
};

