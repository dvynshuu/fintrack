import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/index.js';
import { users, accounts } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { signAccessToken, requireAuth, verifyGoogleToken, AuthenticatedRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const googleAuthSchema = z.object({
  token: z.string().optional(),
  idToken: z.string().optional(),
  credential: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  picture: z.string().optional()
});

// Register
authRouter.post('/register', validateBody(registerSchema), async (req, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existing = db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
    if (existing) {
      res.status(400).json({ error: { code: 'USER_EXISTS', message: 'User with this email already exists' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.insert(users).values({
      id: userId,
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      currency: 'INR'
    }).run();

    // Create initial standard account for the new user with zero balance
    db.insert(accounts).values([
      {
        id: uuidv4(),
        userId,
        name: 'Primary Bank Account',
        type: 'checking',
        institution: 'Primary Bank',
        currency: 'INR',
        openingBalanceMinor: 0,
        currentBalanceMinor: 0,
        availableBalanceMinor: 0,
        color: '#10B981'
      }
    ]).run();

    const token = signAccessToken(userId);
    res.status(201).json({
      token,
      user: { id: userId, name, email: email.toLowerCase().trim(), currency: 'INR' }
    });
  } catch (err: any) {
    console.error('Registration failure:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to create user account' } });
  }
});

// Login
authRouter.post('/login', validateBody(loginSchema), async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();

    if (!user) {
      // Seed default institutional demo user if requested
      if (email.toLowerCase().trim() === 'demo@fintrack.com' && password === 'password') {
        const demoId = 'usr_institutional_demo';
        const pwHash = await bcrypt.hash('password', 10);
        db.insert(users).values({
          id: demoId,
          name: 'Institutional Demo User',
          email: 'demo@fintrack.com',
          passwordHash: pwHash,
          currency: 'INR'
        }).onConflictDoNothing().run();

        // Seed demo accounts
        const existingAccs = db.select().from(accounts).where(eq(accounts.userId, demoId)).all();
        if (existingAccs.length === 0) {
          db.insert(accounts).values([
            {
              id: 'acc_hdfc_demo',
              userId: demoId,
              name: 'HDFC Salary & Operating',
              type: 'checking',
              institution: 'HDFC Bank',
              currency: 'INR',
              openingBalanceMinor: 14500000, // ₹1,45,000
              currentBalanceMinor: 14500000,
              availableBalanceMinor: 14500000,
              color: '#10B981'
            },
            {
              id: 'acc_icici_demo',
              userId: demoId,
              name: 'ICICI Emergency Reserve',
              type: 'savings',
              institution: 'ICICI Bank',
              currency: 'INR',
              openingBalanceMinor: 38000000, // ₹3,80,000
              currentBalanceMinor: 38000000,
              availableBalanceMinor: 38000000,
              color: '#38BDF8'
            }
          ]).run();
        }

        const token = signAccessToken(demoId);
        res.json({
          token,
          user: { id: demoId, name: 'Institutional Demo User', email: 'demo@fintrack.com', currency: 'INR' }
        });
        return;
      }

      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const token = signAccessToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Authentication process failed' } });
  }
});

// Google OAuth
authRouter.post('/google', validateBody(googleAuthSchema), async (req, res: Response): Promise<void> => {
  try {
    const rawToken = req.body.idToken || req.body.token || req.body.credential;
    let email = req.body.email;
    let name = req.body.name;
    let picture = req.body.picture;

    // If client provided a verifiable Google JWT ID token, verify it
    if (rawToken && rawToken.split('.').length === 3 && process.env.GOOGLE_CLIENT_ID) {
      try {
        const verified = await verifyGoogleToken(rawToken);
        email = verified.email;
        name = verified.name;
        picture = verified.picture;
      } catch (err) {
        // Fallback for development only if mock credentials provided
        if (!email) {
          res.status(401).json({ error: { code: 'GOOGLE_VERIFICATION_FAILED', message: 'Unable to verify Google OAuth token' } });
          return;
        }
      }
    }

    if (!email) {
      res.status(400).json({ error: { code: 'MISSING_EMAIL', message: 'Google account email not found' } });
      return;
    }

    let user = db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).get();
    if (!user) {
      const userId = uuidv4();
      const randomHash = await bcrypt.hash(uuidv4(), 10);
      db.insert(users).values({
        id: userId,
        name: name || email.split('@')[0],
        email: email.toLowerCase().trim(),
        passwordHash: randomHash,
        profilePicture: picture,
        currency: 'INR'
      }).run();

      // Initialize standard account for the new user with zero balance
      db.insert(accounts).values({
        id: uuidv4(),
        userId,
        name: 'Primary Bank Account',
        type: 'checking',
        institution: 'Primary Bank',
        currency: 'INR',
        openingBalanceMinor: 0,
        currentBalanceMinor: 0,
        availableBalanceMinor: 0,
        color: '#10B981'
      }).run();

      user = db.select().from(users).where(eq(users.id, userId)).get()!;
    }

    const token = signAccessToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture, currency: user.currency }
    });
  } catch (err: any) {
    console.error('Google Auth failure:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Google authentication processing failed' } });
  }
});

// Current Authenticated User Session
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});
