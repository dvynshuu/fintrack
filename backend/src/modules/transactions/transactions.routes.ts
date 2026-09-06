import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/index.js';
import { transactions, transactionEntries, accounts, categories, auditEvents, transfers } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { toMinorUnits, toMajorUnits, addMoney, subtractMoney } from '../../utils/money.js';

export const transactionsRouter = Router();

const createTransactionSchema = z.object({
  accountId: z.string().optional(),
  type: z.enum(['expense', 'income', 'transfer', 'refund', 'fee']).default('expense'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  date: z.string().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  merchant: z.string().optional(),
  notes: z.string().optional()
}).refine(data => !!(data.description || data.title), {
  message: 'Description or title is required',
  path: ['description']
});

const createTransferSchema = z.object({
  sourceAccountId: z.string().min(1, 'Source account is required'),
  destinationAccountId: z.string().min(1, 'Destination account is required'),
  amount: z.number().positive('Transfer amount must be positive'),
  currency: z.string().default('INR'),
  date: z.string().optional(),
  notes: z.string().optional()
});

// ── GET ALL TRANSACTIONS (Unified Ledger) ──
transactionsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { limit = '100', offset = '0', type } = req.query;

  const conditions = [eq(transactions.userId, userId)];
  if (type) {
    conditions.push(eq(transactions.type, String(type)));
  }

  const rows = db.select({
    id: transactions.id,
    userId: transactions.userId,
    accountId: transactions.accountId,
    accountName: accounts.name,
    type: transactions.type,
    status: transactions.status,
    amountMinor: transactions.amountMinor,
    currency: transactions.currency,
    date: transactions.date,
    description: transactions.description,
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    notes: transactions.notes,
    createdAt: transactions.createdAt
  })
  .from(transactions)
  .leftJoin(accounts, eq(transactions.accountId, accounts.id))
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(and(...conditions))
  .orderBy(desc(transactions.date))
  .limit(Number(limit))
  .offset(Number(offset))
  .all();

  const formatted = rows.map(r => ({
    _id: r.id,
    id: r.id,
    accountId: r.accountId,
    accountName: r.accountName || 'Primary Account',
    type: r.type,
    status: r.status,
    amount: toMajorUnits(r.amountMinor),
    amountMinor: r.amountMinor,
    currency: r.currency,
    date: r.date,
    description: r.description,
    title: r.description,
    category: r.categoryName || 'Other',
    categoryId: r.categoryId,
    notes: r.notes,
    createdAt: r.createdAt
  }));

  res.json(formatted);
});

// ── CREATE TRANSACTION (Double-Entry Ledger) ──
transactionsRouter.post('/', requireAuth, validateBody(createTransactionSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  let { accountId, type, amount, currency, date, description, title, category, categoryId, notes } = req.body;
  const txDesc = description || title || 'Expense';

  if (!accountId) {
    let userAcc = db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false))).get();
    if (!userAcc) {
      const defaultAccId = uuidv4();
      db.insert(accounts).values({
        id: defaultAccId,
        userId,
        name: 'Primary Bank Account',
        type: 'checking',
        institution: 'Primary Bank',
        currency: currency || 'INR',
        openingBalanceMinor: 0,
        currentBalanceMinor: 0,
        availableBalanceMinor: 0,
        color: '#10B981'
      }).run();
      userAcc = db.select().from(accounts).where(eq(accounts.id, defaultAccId)).get()!;
    }
    accountId = userAcc.id;
  }

  const amountMinor = toMinorUnits(amount);
  const txDate = date || new Date().toISOString();
  const txId = uuidv4();

  let matchedCategoryId = categoryId;
  if (!matchedCategoryId && category) {
    const allCats = db.select().from(categories).all();
    const foundCat = allCats.find(c =>
      c.name.toLowerCase() === category.toLowerCase() ||
      c.name.toLowerCase().startsWith(category.toLowerCase()) ||
      category.toLowerCase().startsWith(c.name.toLowerCase())
    );
    if (foundCat) matchedCategoryId = foundCat.id;
  }

  db.insert(transactions).values({
    id: txId,
    userId,
    accountId,
    type,
    amountMinor,
    currency: currency || 'INR',
    date: txDate,
    description: txDesc,
    categoryId: matchedCategoryId,
    notes
  }).run();

  const targetAcc = db.select().from(accounts).where(eq(accounts.id, accountId)).get();
  if (targetAcc) {
    let newBalMinor = targetAcc.currentBalanceMinor;
    if (type === 'income' || type === 'refund') {
      newBalMinor = addMoney(newBalMinor, amountMinor);
      db.insert(transactionEntries).values({
        id: uuidv4(),
        transactionId: txId,
        accountId,
        entryType: 'debit',
        amountMinor,
        currency: currency || 'INR'
      }).run();
    } else {
      newBalMinor = subtractMoney(newBalMinor, amountMinor);
      db.insert(transactionEntries).values({
        id: uuidv4(),
        transactionId: txId,
        accountId,
        entryType: 'credit',
        amountMinor,
        currency: currency || 'INR'
      }).run();
    }

    db.update(accounts).set({
      currentBalanceMinor: newBalMinor,
      availableBalanceMinor: newBalMinor,
      updatedAt: new Date().toISOString()
    }).where(eq(accounts.id, accountId)).run();
  }

  db.insert(auditEvents).values({
    id: uuidv4(),
    userId,
    action: 'create',
    entityType: 'transaction',
    entityId: txId,
    payloadSummary: `Created ${type}: "${description}" of ${amount}`
  }).run();

  const created = db.select().from(transactions).where(eq(transactions.id, txId)).get()!;
  res.status(201).json({
    ...created,
    _id: created.id,
    amount: toMajorUnits(created.amountMinor),
    description: created.description,
    title: created.description,
    category: category || 'Other'
  });
});

// ── EXECUTE ACCOUNT-TO-ACCOUNT TRANSFER ──
transactionsRouter.post('/transfer', requireAuth, validateBody(createTransferSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { sourceAccountId, destinationAccountId, amount, currency, date, notes } = req.body;

  if (sourceAccountId === destinationAccountId) {
    res.status(400).json({ error: { code: 'INVALID_TRANSFER', message: 'Source and destination accounts must be different.' } });
    return;
  }

  const srcAcc = db.select().from(accounts).where(and(eq(accounts.id, sourceAccountId), eq(accounts.userId, userId))).get();
  const destAcc = db.select().from(accounts).where(and(eq(accounts.id, destinationAccountId), eq(accounts.userId, userId))).get();

  if (!srcAcc || !destAcc) {
    res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'One or both accounts not found.' } });
    return;
  }

  const amountMinor = toMinorUnits(amount);
  const txDate = date || new Date().toISOString();
  const transferId = uuidv4();
  const srcTxId = uuidv4();
  const destTxId = uuidv4();

  db.insert(transactions).values({
    id: srcTxId,
    userId,
    accountId: sourceAccountId,
    type: 'transfer',
    amountMinor,
    currency: currency || 'INR',
    date: txDate,
    description: `Transfer to ${destAcc.name}`,
    transferId,
    notes
  }).run();

  db.insert(transactions).values({
    id: destTxId,
    userId,
    accountId: destinationAccountId,
    type: 'transfer',
    amountMinor,
    currency: currency || 'INR',
    date: txDate,
    description: `Transfer from ${srcAcc.name}`,
    transferId,
    notes
  }).run();

  db.insert(transactionEntries).values([
    {
      id: uuidv4(),
      transactionId: srcTxId,
      accountId: sourceAccountId,
      entryType: 'credit',
      amountMinor,
      currency: currency || 'INR'
    },
    {
      id: uuidv4(),
      transactionId: destTxId,
      accountId: destinationAccountId,
      entryType: 'debit',
      amountMinor,
      currency: currency || 'INR'
    }
  ]).run();

  db.update(accounts).set({
    currentBalanceMinor: subtractMoney(srcAcc.currentBalanceMinor, amountMinor),
    availableBalanceMinor: subtractMoney(srcAcc.availableBalanceMinor, amountMinor),
    updatedAt: new Date().toISOString()
  }).where(eq(accounts.id, sourceAccountId)).run();

  db.update(accounts).set({
    currentBalanceMinor: addMoney(destAcc.currentBalanceMinor, amountMinor),
    availableBalanceMinor: addMoney(destAcc.availableBalanceMinor, amountMinor),
    updatedAt: new Date().toISOString()
  }).where(eq(accounts.id, destinationAccountId)).run();

  db.insert(transfers).values({
    id: transferId,
    userId,
    sourceAccountId,
    destinationAccountId,
    sourceTransactionId: srcTxId,
    destinationTransactionId: destTxId,
    amountMinor,
    currency: currency || 'INR',
    date: txDate,
    notes
  }).run();

  res.status(201).json({
    transferId,
    message: 'Transfer completed successfully with double-entry integrity.',
    amount: toMajorUnits(amountMinor),
    sourceAccount: srcAcc.name,
    destinationAccount: destAcc.name
  });
});

// ── UPDATE TRANSACTION ──
transactionsRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);
  const { description, title, amount, date, category } = req.body;

  const existing = db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).get();
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
    return;
  }

  const updates: any = { updatedAt: new Date().toISOString() };
  const txDesc = description || title;
  if (txDesc) updates.description = txDesc;
  if (date) updates.date = date;

  if (category) {
    const allCats = db.select().from(categories).all();
    const foundCat = allCats.find(c =>
      c.name.toLowerCase() === category.toLowerCase() ||
      c.name.toLowerCase().startsWith(category.toLowerCase()) ||
      category.toLowerCase().startsWith(c.name.toLowerCase())
    );
    if (foundCat) updates.categoryId = foundCat.id;
  }

  if (amount !== undefined && amount > 0) {
    const newMinor = toMinorUnits(amount);
    const diff = newMinor - existing.amountMinor;
    updates.amountMinor = newMinor;

    const acc = db.select().from(accounts).where(eq(accounts.id, existing.accountId)).get();
    if (acc) {
      let updatedBal = acc.currentBalanceMinor;
      if (existing.type === 'income') updatedBal += diff;
      else if (existing.type === 'expense') updatedBal -= diff;

      db.update(accounts).set({
        currentBalanceMinor: updatedBal,
        availableBalanceMinor: updatedBal
      }).where(eq(accounts.id, acc.id)).run();
    }
  }

  db.update(transactions).set(updates).where(eq(transactions.id, id)).run();

  const updated = db.select().from(transactions).where(eq(transactions.id, id)).get()!;
  res.json({
    ...updated,
    _id: updated.id,
    amount: toMajorUnits(updated.amountMinor),
    description: updated.description,
    title: updated.description,
    category: category || 'Other'
  });
});

// ── DELETE TRANSACTION ──
transactionsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const id = String(req.params.id);

  const existing = db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).get();
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
    return;
  }

  const acc = db.select().from(accounts).where(eq(accounts.id, existing.accountId)).get();
  if (acc) {
    let reversedBal = acc.currentBalanceMinor;
    if (existing.type === 'income') reversedBal -= existing.amountMinor;
    else if (existing.type === 'expense') reversedBal += existing.amountMinor;

    db.update(accounts).set({
      currentBalanceMinor: reversedBal,
      availableBalanceMinor: reversedBal
    }).where(eq(accounts.id, acc.id)).run();
  }

  db.delete(transactions).where(eq(transactions.id, id)).run();
  res.json({ message: 'Transaction removed successfully' });
});
