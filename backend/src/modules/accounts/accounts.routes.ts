import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/index.js';
import { accounts, auditEvents } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { toMinorUnits, toMajorUnits } from '../../utils/money.js';

export const accountsRouter = Router();

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment', 'loan', 'mortgage']),
  institution: z.string().optional(),
  currency: z.string().default('INR'),
  openingBalance: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional()
});

// List user's accounts
accountsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userAccounts = db.select().from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false)))
    .all();

  const formatted = userAccounts.map(acc => ({
    ...acc,
    currentBalance: toMajorUnits(acc.currentBalanceMinor),
    openingBalance: toMajorUnits(acc.openingBalanceMinor),
    availableBalance: toMajorUnits(acc.availableBalanceMinor)
  }));

  res.json(formatted);
});

// Create an account
accountsRouter.post('/', requireAuth, validateBody(createAccountSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { name, type, institution, currency, openingBalance, color, icon } = req.body;
  const balanceMinor = toMinorUnits(openingBalance);
  const accountId = uuidv4();

  db.insert(accounts).values({
    id: accountId,
    userId,
    name,
    type,
    institution: institution || 'General Ledger',
    currency: currency || 'INR',
    openingBalanceMinor: balanceMinor,
    currentBalanceMinor: balanceMinor,
    availableBalanceMinor: balanceMinor,
    color: color || '#10B981',
    icon: icon || 'wallet'
  }).run();

  db.insert(auditEvents).values({
    id: uuidv4(),
    userId,
    action: 'create',
    entityType: 'account',
    entityId: accountId,
    payloadSummary: `Created account "${name}" with opening balance ${openingBalance}`
  }).run();

  const created = db.select().from(accounts).where(eq(accounts.id, accountId)).get()!;
  res.status(201).json({
    ...created,
    currentBalance: toMajorUnits(created.currentBalanceMinor),
    openingBalance: toMajorUnits(created.openingBalanceMinor)
  });
});

// Update an account
accountsRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);
  const { name, institution, color, icon, currentBalance } = req.body;

  const existing = db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).get();
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
    return;
  }

  const updateData: any = {
    updatedAt: new Date().toISOString()
  };
  if (name !== undefined) updateData.name = name;
  if (institution !== undefined) updateData.institution = institution;
  if (color !== undefined) updateData.color = color;
  if (icon !== undefined) updateData.icon = icon;
  if (currentBalance !== undefined) {
    const minor = toMinorUnits(currentBalance);
    updateData.currentBalanceMinor = minor;
    updateData.availableBalanceMinor = minor;
  }

  db.update(accounts).set(updateData).where(eq(accounts.id, id)).run();

  const updated = db.select().from(accounts).where(eq(accounts.id, id)).get()!;
  res.json({
    ...updated,
    currentBalance: toMajorUnits(updated.currentBalanceMinor)
  });
});

// Archive an account
accountsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);

  const existing = db.select().from(accounts).where(and(eq(accounts.id, id), eq(accounts.userId, userId))).get();
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Account not found' } });
    return;
  }

  db.update(accounts).set({ isArchived: true }).where(eq(accounts.id, id)).run();
  res.json({ message: 'Account archived successfully' });
});
