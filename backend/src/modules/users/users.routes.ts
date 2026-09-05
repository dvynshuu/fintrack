import { Router, Response } from 'express';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';

export const usersRouter = Router();

// Profile
usersRouter.get('/profile', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    return;
  }

  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

usersRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { name, phone, location, currency, language } = req.body;

  const updates: any = { updatedAt: new Date().toISOString() };
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (location !== undefined) updates.location = location;
  if (currency) updates.currency = currency;
  if (language) updates.language = language;

  db.update(users).set(updates).where(eq(users.id, userId)).run();

  const user = db.select().from(users).where(eq(users.id, userId)).get()!;
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

// Settings
usersRouter.get('/settings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const user = db.select().from(users).where(eq(users.id, userId)).get();

  res.json({
    theme: 'dark',
    currency: user?.currency || 'INR',
    language: user?.language || 'en',
    notifications: { email: true, push: true },
    display: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h' }
  });
});

usersRouter.put('/settings', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { currency, language } = req.body;

  if (currency || language) {
    const updates: any = { updatedAt: new Date().toISOString() };
    if (currency) updates.currency = currency;
    if (language) updates.language = language;
    db.update(users).set(updates).where(eq(users.id, userId)).run();
  }

  res.json(req.body);
});
