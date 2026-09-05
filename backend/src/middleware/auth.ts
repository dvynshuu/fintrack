import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  currency: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fintrack-master-production-secret-grade-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Strict Fail-Closed Authentication Middleware.
 * Never silently falls back to a mock/demo account.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. No valid Bearer token provided.',
        status: 401
      }
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'The authentication token payload is malformed or expired.',
          status: 401
        }
      });
      return;
    }

    const user = db.select().from(users).where(eq(users.id, decoded.userId)).get();
    if (!user) {
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The authenticated user session does not exist.',
          status: 401
        }
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      currency: user.currency
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: err.message || 'Session expired. Please sign in again.',
        status: 401
      }
    });
  }
}

/**
 * Signs a canonical JWT access token.
 */
export function signAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a Google ID token server-side with official Google OAuth certificates.
 */
export async function verifyGoogleToken(idToken: string) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured on server.');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.email_verified) {
    throw new Error('Google token validation failed: unverified email or invalid ticket.');
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture,
    sub: payload.sub
  };
}
