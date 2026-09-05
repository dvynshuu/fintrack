import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/index.js';
import { goals, accounts, transactions, auditEvents } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { toMinorUnits, toMajorUnits, addMoney, subtractMoney } from '../../utils/money.js';

export const goalsRouter = Router();

const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().default('savings'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().default(0),
  targetDate: z.string().min(1, 'Target date is required'),
  notes: z.string().optional(),
  priority: z.string().default('medium'),
  linkedAccountId: z.string().optional()
});

const depositGoalSchema = z.object({
  amount: z.number().positive('Deposit amount must be positive'),
  sourceAccountId: z.string().optional(),
  recordTransaction: z.boolean().default(false)
});

// ── LIST ALL GOALS ──
goalsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userGoals = db.select().from(goals).where(eq(goals.userId, userId)).all();

  const formatted = userGoals.map(g => {
    const target = toMajorUnits(g.targetAmountMinor);
    const current = toMajorUnits(g.currentAmountMinor);
    const remaining = Math.max(0, target - current);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    const now = new Date();
    const targetD = new Date(g.targetDate);
    const monthsRemaining = Math.max(1, (targetD.getFullYear() - now.getFullYear()) * 12 + (targetD.getMonth() - now.getMonth()));
    const requiredMonthly = remaining / monthsRemaining;

    return {
      _id: g.id,
      id: g.id,
      title: g.title,
      type: g.type,
      targetAmount: target,
      targetAmountMinor: g.targetAmountMinor,
      currentAmount: current,
      currentAmountMinor: g.currentAmountMinor,
      targetDate: g.targetDate,
      status: g.status,
      priority: g.priority,
      notes: g.notes,
      progress,
      remaining,
      requiredMonthly: Math.round(requiredMonthly),
      monthsRemaining,
      createdAt: g.createdAt
    };
  });

  res.json(formatted);
});

// ── CREATE GOAL ──
goalsRouter.post('/', requireAuth, validateBody(createGoalSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { title, type, targetAmount, currentAmount, targetDate, notes, priority, linkedAccountId } = req.body;

  const goalId = uuidv4();
  const targetMinor = toMinorUnits(targetAmount);
  const currentMinor = toMinorUnits(currentAmount || 0);

  db.insert(goals).values({
    id: goalId,
    userId,
    title,
    type: type || 'savings',
    targetAmountMinor: targetMinor,
    currentAmountMinor: currentMinor,
    targetDate,
    status: currentMinor >= targetMinor ? 'completed' : 'in_progress',
    priority: priority || 'medium',
    linkedAccountId,
    notes
  }).run();

  db.insert(auditEvents).values({
    id: uuidv4(),
    userId,
    action: 'create',
    entityType: 'goal',
    entityId: goalId,
    payloadSummary: `Created goal: "${title}" target ${targetAmount}`
  }).run();

  const created = db.select().from(goals).where(eq(goals.id, goalId)).get()!;
  res.status(201).json({
    ...created,
    _id: created.id,
    targetAmount: toMajorUnits(created.targetAmountMinor),
    currentAmount: toMajorUnits(created.currentAmountMinor)
  });
});

// ── UPDATE GOAL ──
goalsRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);
  const { title, type, targetAmount, currentAmount, targetDate, notes, status, priority } = req.body;

  const existing = db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).get();
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    return;
  }

  const updates: any = { updatedAt: new Date().toISOString() };
  if (title) updates.title = title;
  if (type) updates.type = type;
  if (targetDate) updates.targetDate = targetDate;
  if (notes !== undefined) updates.notes = notes;
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (targetAmount !== undefined) updates.targetAmountMinor = toMinorUnits(targetAmount);
  if (currentAmount !== undefined) updates.currentAmountMinor = toMinorUnits(currentAmount);

  db.update(goals).set(updates).where(eq(goals.id, id)).run();

  const updated = db.select().from(goals).where(eq(goals.id, id)).get()!;
  res.json({
    ...updated,
    _id: updated.id,
    targetAmount: toMajorUnits(updated.targetAmountMinor),
    currentAmount: toMajorUnits(updated.currentAmountMinor)
  });
});

// ── DEPOSIT CAPITAL INTO GOAL WITH AUDIT TRAIL ──
goalsRouter.post('/:id/deposit', requireAuth, validateBody(depositGoalSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);
  const { amount, sourceAccountId, recordTransaction } = req.body;

  const goal = db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).get();
  if (!goal) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    return;
  }

  const depositMinor = toMinorUnits(amount);
  const newCurrentMinor = addMoney(goal.currentAmountMinor, depositMinor);
  const newStatus = newCurrentMinor >= goal.targetAmountMinor ? 'completed' : 'in_progress';

  if (recordTransaction && sourceAccountId) {
    const acc = db.select().from(accounts).where(and(eq(accounts.id, sourceAccountId), eq(accounts.userId, userId))).get();
    if (acc) {
      const txId = uuidv4();
      db.insert(transactions).values({
        id: txId,
        userId,
        accountId: sourceAccountId,
        type: 'expense',
        amountMinor: depositMinor,
        currency: 'INR',
        date: new Date().toISOString(),
        description: `Goal Allocation: ${goal.title}`,
        notes: `Direct capital allocation to goal "${goal.title}"`
      }).run();

      db.update(accounts).set({
        currentBalanceMinor: subtractMoney(acc.currentBalanceMinor, depositMinor),
        availableBalanceMinor: subtractMoney(acc.availableBalanceMinor, depositMinor),
        updatedAt: new Date().toISOString()
      }).where(eq(accounts.id, sourceAccountId)).run();
    }
  }

  db.update(goals).set({
    currentAmountMinor: newCurrentMinor,
    status: newStatus,
    updatedAt: new Date().toISOString()
  }).where(eq(goals.id, id)).run();

  db.insert(auditEvents).values({
    id: uuidv4(),
    userId,
    action: 'deposit',
    entityType: 'goal',
    entityId: id,
    payloadSummary: `Deposited ${amount} into goal "${goal.title}"`
  }).run();

  const updated = db.select().from(goals).where(eq(goals.id, id)).get()!;
  res.json({
    ...updated,
    _id: updated.id,
    targetAmount: toMajorUnits(updated.targetAmountMinor),
    currentAmount: toMajorUnits(updated.currentAmountMinor),
    message: `Allocated ₹${amount} towards ${goal.title}`
  });
});

// ── DELETE GOAL ──
goalsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);

  const existing = db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).get();
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    return;
  }

  db.delete(goals).where(eq(goals.id, id)).run();
  res.json({ message: 'Goal removed successfully' });
});
