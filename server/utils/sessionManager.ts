import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

interface Session {
  token: string;
  createdAt: number;
  expiresAt: number;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Create a new session after successful password verification
   */
  async createSession(password: string): Promise<string> {
    // Verify password matches the one in environment
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      throw new Error('Invalid password');
    }

    // Generate a random session token
    const tokenBytes = randomBytes(32);
    const token = tokenBytes.toString('hex');

    // Hash the token for storage
    const hashedToken = await bcrypt.hash(token, 10);

    // Store the session
    const now = Date.now();
    this.sessions.set(hashedToken, {
      token: hashedToken,
      createdAt: now,
      expiresAt: now + this.SESSION_DURATION,
    });

    // Clean up old sessions
    this.cleanupExpiredSessions();

    // Return the unhashed token to send to client
    return token;
  }

  /**
   * Verify a session token
   */
  async verifyToken(token: string): Promise<boolean> {
    // Clean up expired sessions first
    this.cleanupExpiredSessions();

    // Check each stored session
    for (const [hashedToken, session] of this.sessions.entries()) {
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        continue;
      }

      // Check if token matches
      const isValid = await bcrypt.compare(token, hashedToken);
      if (isValid) {
        return true;
      }
    }

    return false;
  }

  /**
   * Remove a session (logout)
   */
  async removeSession(token: string): Promise<void> {
    for (const [hashedToken] of this.sessions.entries()) {
      const isMatch = await bcrypt.compare(token, hashedToken);
      if (isMatch) {
        this.sessions.delete(hashedToken);
        return;
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [hashedToken, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(hashedToken);
      }
    }
  }

  /**
   * Get active session count (for debugging)
   */
  getActiveSessionCount(): number {
    this.cleanupExpiredSessions();
    return this.sessions.size;
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

