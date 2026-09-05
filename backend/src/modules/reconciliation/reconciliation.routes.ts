import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/index.js';
import { transactions, transactionEntries, accounts, auditEvents, reconciliations } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { parseCsvString, autoDetectColumnMapping, generateImportPreview, NormalizedImportTransaction } from '../imports/import-engine.js';
import { toMajorUnits, toMinorUnits, addMoney, subtractMoney } from '../../utils/money.js';

export const reconciliationRouter = Router();

const previewImportSchema = z.object({
  accountId: z.string().min(1, 'Target account ID is required'),
  csvContent: z.string().min(1, 'CSV content is required')
});

const commitImportSchema = z.object({
  accountId: z.string().min(1, 'Target account ID is required'),
  transactions: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amountMinor: z.number().positive(),
    type: z.enum(['expense', 'income']),
    fingerprint: z.string().optional()
  }))
});

// ── IMPORT PREVIEW & DUPLICATE DETECTION ──
reconciliationRouter.post('/imports/preview', requireAuth, validateBody(previewImportSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { accountId, csvContent } = req.body;

  const targetAcc = db.select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, userId))).get();
  if (!targetAcc) {
    res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Target account not found' } });
    return;
  }

  // Parse CSV
  const rows = parseCsvString(csvContent);
  if (rows.length === 0) {
    res.status(400).json({ error: { code: 'EMPTY_CSV', message: 'No valid data rows detected in CSV' } });
    return;
  }

  // Retrieve existing fingerprints for this account
  const existingTxs = db.select({ fingerprint: transactions.fingerprint })
    .from(transactions)
    .where(and(eq(transactions.accountId, accountId), eq(transactions.userId, userId)))
    .all();

  const fingerprintSet = new Set<string>();
  for (const t of existingTxs) {
    if (t.fingerprint) fingerprintSet.add(t.fingerprint);
  }

  // Infer mapping
  const headers = Object.keys(rows[0]);
  const mapping = autoDetectColumnMapping(headers);

  // Generate preview
  const preview = generateImportPreview(rows, mapping, accountId, fingerprintSet);

  res.json({
    accountName: targetAcc.name,
    detectedHeaders: headers,
    inferredMapping: mapping,
    preview: {
      ...preview,
      transactions: preview.transactions.map(t => ({
        ...t,
        amount: toMajorUnits(t.amountMinor)
      }))
    }
  });
});

// ── COMMIT IMPORTED TRANSACTIONS TO LEDGER ──
reconciliationRouter.post('/imports/commit', requireAuth, validateBody(commitImportSchema), (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const { accountId, transactions: txToImport } = req.body;

  const targetAcc = db.select().from(accounts).where(and(eq(accounts.id, accountId), eq(accounts.userId, userId))).get();
  if (!targetAcc) {
    res.status(404).json({ error: { code: 'ACCOUNT_NOT_FOUND', message: 'Target account not found' } });
    return;
  }

  let totalBalChange = 0;
  let importedCount = 0;

  for (const item of txToImport) {
    const txId = uuidv4();
    db.insert(transactions).values({
      id: txId,
      userId,
      accountId,
      type: item.type,
      amountMinor: item.amountMinor,
      currency: 'INR',
      date: item.date,
      description: item.description,
      fingerprint: item.fingerprint
    }).run();

    if (item.type === 'income') {
      totalBalChange += item.amountMinor;
      db.insert(transactionEntries).values({
        id: uuidv4(),
        transactionId: txId,
        accountId,
        entryType: 'debit',
        amountMinor: item.amountMinor,
        currency: 'INR'
      }).run();
    } else {
      totalBalChange -= item.amountMinor;
      db.insert(transactionEntries).values({
        id: uuidv4(),
        transactionId: txId,
        accountId,
        entryType: 'credit',
        amountMinor: item.amountMinor,
        currency: 'INR'
      }).run();
    }

    importedCount++;
  }

  // Update account balance
  const updatedBalance = targetAcc.currentBalanceMinor + totalBalChange;
  db.update(accounts).set({
    currentBalanceMinor: updatedBalance,
    availableBalanceMinor: updatedBalance,
    updatedAt: new Date().toISOString()
  }).where(eq(accounts.id, accountId)).run();

  db.insert(auditEvents).values({
    id: uuidv4(),
    userId,
    action: 'import',
    entityType: 'account',
    entityId: accountId,
    payloadSummary: `Batch imported ${importedCount} transactions into ${targetAcc.name}`
  }).run();

  res.status(201).json({
    message: `Successfully imported ${importedCount} transactions into ${targetAcc.name}`,
    newBalance: toMajorUnits(updatedBalance),
    importedCount
  });
});
