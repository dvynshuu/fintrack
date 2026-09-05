import { Router, Response } from 'express';
import { db } from '../../db/index.js';
import { transactions, accounts, categories } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { detectSubscriptions } from '../intelligence/subscription-detector.js';
import { simulateFinancialScenario, SimulationParams } from '../intelligence/scenario-engine.js';
import { toMajorUnits } from '../../utils/money.js';

export const subscriptionsRouter = Router();

// ── GET DETECTED SUBSCRIPTIONS & RECURRING CHARGES ──
subscriptionsRouter.get('/subscriptions', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;

  const userExpenses = db.select({
    id: transactions.id,
    description: transactions.description,
    amountMinor: transactions.amountMinor,
    date: transactions.date,
    categoryName: categories.name
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, userId))
  .orderBy(desc(transactions.date))
  .all();

  const expenseItems = userExpenses.map(e => ({
    id: e.id,
    description: e.description,
    amountMinor: e.amountMinor,
    date: e.date,
    category: e.categoryName || undefined
  }));

  const result = detectSubscriptions(expenseItems);
  res.json(result);
});

// ── EXECUTE DETERMINISTIC SCENARIO SIMULATION ──
subscriptionsRouter.post('/scenarios/simulate', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const params: SimulationParams = req.body;
  const result = simulateFinancialScenario(params);
  res.json(result);
});

// ── "WHAT CHANGED?" ONE-CLICK FINANCIAL DIAGNOSIS ──
subscriptionsRouter.get('/analytics/what-changed', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;

  const userTxs = db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    date: transactions.date,
    description: transactions.description,
    categoryName: categories.name
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, userId))
  .all();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  let curIncome = 0;
  let prevIncome = 0;
  let curExpense = 0;
  let prevExpense = 0;

  const curCatMap: { [c: string]: number } = {};
  const prevCatMap: { [c: string]: number } = {};

  for (const t of userTxs) {
    const d = new Date(t.date);
    if (isNaN(d.getTime())) continue;

    const amt = toMajorUnits(t.amountMinor);
    const cat = t.categoryName || 'Other';

    if (d >= thirtyDaysAgo && d <= now) {
      if (t.type === 'income') curIncome += amt;
      else if (t.type === 'expense') {
        curExpense += amt;
        curCatMap[cat] = (curCatMap[cat] || 0) + amt;
      }
    } else if (d >= sixtyDaysAgo && d < thirtyDaysAgo) {
      if (t.type === 'income') prevIncome += amt;
      else if (t.type === 'expense') {
        prevExpense += amt;
        prevCatMap[cat] = (prevCatMap[cat] || 0) + amt;
      }
    }
  }

  const incomeDelta = curIncome - prevIncome;
  const expenseDelta = curExpense - prevExpense;
  const curSavings = curIncome - curExpense;
  const prevSavings = prevIncome - prevExpense;
  const netSavingsDelta = curSavings - prevSavings;

  // Compute category shifts
  const allCategories = Array.from(new Set([...Object.keys(curCatMap), ...Object.keys(prevCatMap)]));
  const categoryDeltas = allCategories.map(cat => {
    const cur = curCatMap[cat] || 0;
    const prev = prevCatMap[cat] || 0;
    const delta = cur - prev;
    return {
      category: cat,
      current: Math.round(cur),
      previous: Math.round(prev),
      delta: Math.round(delta),
      percentageChange: prev > 0 ? Math.round((delta / prev) * 100) : cur > 0 ? 100 : 0
    };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  res.json({
    summary: {
      netSavingsDelta: Math.round(netSavingsDelta),
      incomeDelta: Math.round(incomeDelta),
      expenseDelta: Math.round(expenseDelta),
      currentSavings: Math.round(curSavings),
      previousSavings: Math.round(prevSavings)
    },
    categoryDeltas: categoryDeltas.slice(0, 6)
  });
});
