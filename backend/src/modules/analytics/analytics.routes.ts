import { Router, Response } from 'express';
import { db } from '../../db/index.js';
import { accounts, transactions, goals, categories } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { calculateFinancialHealth, detectSpendingAnomalies } from '../intelligence/financial-engine.js';
import { toMajorUnits } from '../../utils/money.js';

export const analyticsRouter = Router();

// ── UNIFIED COMMAND CENTER DASHBOARD SUMMARY ──
analyticsRouter.get('/dashboard/summary', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;

  // 1. Fetch user accounts
  const userAccounts = db.select().from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false)))
    .all();

  // 2. Fetch user transactions (ordered by date desc)
  const userTransactions = db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    currency: transactions.currency,
    date: transactions.date,
    description: transactions.description,
    categoryId: transactions.categoryId,
    categoryName: categories.name
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, userId))
  .orderBy(desc(transactions.date))
  .limit(500)
  .all();

  // 3. Fetch goals
  const userGoals = db.select().from(goals).where(eq(goals.userId, userId)).all();

  // 4. Calculate Deterministic Financial Health & Core Metrics
  const healthResult = calculateFinancialHealth(
    userAccounts.map(a => ({ id: a.id, type: a.type, currentBalanceMinor: a.currentBalanceMinor })),
    userTransactions.map(t => ({ id: t.id, type: t.type, amountMinor: t.amountMinor, date: t.date, description: t.description, category: t.categoryName || undefined })),
    userGoals.map(g => ({ id: g.id, title: g.title, targetAmountMinor: g.targetAmountMinor, currentAmountMinor: g.currentAmountMinor, targetDate: g.targetDate }))
  );

  // 5. Detect Spending Anomalies
  const anomalies = detectSpendingAnomalies(
    userTransactions.map(t => ({ id: t.id, type: t.type, amountMinor: t.amountMinor, date: t.date, description: t.description }))
  );

  // 6. Category breakdown for charts
  const categoryMap: { [cat: string]: number } = {};
  for (const t of userTransactions) {
    if (t.type === 'expense') {
      const cat = t.categoryName || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + toMajorUnits(t.amountMinor);
    }
  }
  const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Math.round(value)
  })).sort((a, b) => b.value - a.value);

  // 7. Monthly Cash Flow Timeline
  const monthlyAgg: { [key: string]: { month: string; income: number; expenses: number } } = {};
  for (const t of userTransactions) {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyAgg[key]) {
        monthlyAgg[key] = { month: key, income: 0, expenses: 0 };
      }
      const major = toMajorUnits(t.amountMinor);
      if (t.type === 'income') monthlyAgg[key].income += major;
      else if (t.type === 'expense') monthlyAgg[key].expenses += major;
    }
  }

  // Ensure chronological sort
  const monthlyTimeline = Object.values(monthlyAgg).sort((a, b) => {
    const [yA, mA] = a.month.split('-').map(Number);
    const [yB, mB] = b.month.split('-').map(Number);
    return yA !== yB ? yA - yB : mA - mB;
  });

  // Recent 10 transactions
  const recentTransactions = userTransactions.slice(0, 10).map(t => ({
    _id: t.id,
    id: t.id,
    description: t.description,
    title: t.description,
    amount: toMajorUnits(t.amountMinor),
    type: t.type,
    category: t.categoryName || 'General',
    date: t.date
  }));

  res.json({
    health: healthResult,
    position: {
      netWorth: toMajorUnits(healthResult.summary.netWorthMinor),
      liquidCash: toMajorUnits(healthResult.summary.liquidCashMinor),
      monthlyIncome: toMajorUnits(healthResult.summary.monthlyIncomeMinor),
      monthlyExpenses: toMajorUnits(healthResult.summary.monthlyExpensesMinor),
      netCashFlow: toMajorUnits(healthResult.summary.netCashFlowMinor),
      savingsRatePercent: healthResult.summary.savingsRatePercent,
      safeToSpend: toMajorUnits(healthResult.summary.safeToSpendMinor),
      cashRunwayMonths: healthResult.summary.cashRunwayMonths
    },
    anomalies: anomalies.map(a => ({
      ...a,
      amount: toMajorUnits(a.amountMinor)
    })),
    categoryBreakdown,
    monthlyTimeline,
    recentTransactions,
    accounts: userAccounts.map(a => ({
      id: a.id,
      name: a.name,
      type: a.type,
      institution: a.institution,
      currentBalance: toMajorUnits(a.currentBalanceMinor),
      color: a.color
    })),
    goals: userGoals.map(g => ({
      id: g.id,
      title: g.title,
      targetAmount: toMajorUnits(g.targetAmountMinor),
      currentAmount: toMajorUnits(g.currentAmountMinor),
      progress: Math.min(100, Math.round((g.currentAmountMinor / Math.max(1, g.targetAmountMinor)) * 100)),
      targetDate: g.targetDate
    }))
  });
});

// ── BACKWARD-COMPATIBLE MONTHLY TIMELINE ──
analyticsRouter.get('/expenses/monthly', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userTransactions = db.select().from(transactions).where(eq(transactions.userId, userId)).all();

  const monthlyAgg: { [key: string]: { month: string; income: number; expenses: number } } = {};
  for (const t of userTransactions) {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyAgg[key]) {
        monthlyAgg[key] = { month: key, income: 0, expenses: 0 };
      }
      const major = toMajorUnits(t.amountMinor);
      if (t.type === 'income') monthlyAgg[key].income += major;
      else if (t.type === 'expense') monthlyAgg[key].expenses += major;
    }
  }

  const result = Object.values(monthlyAgg).sort((a, b) => {
    const [yA, mA] = a.month.split('-').map(Number);
    const [yB, mB] = b.month.split('-').map(Number);
    return yA !== yB ? yA - yB : mA - mB;
  });

  res.json(result);
});

// ── BACKWARD-COMPATIBLE EXPENSES SUMMARY ──
analyticsRouter.get('/expenses/summary', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const expList = db.select({
    amountMinor: transactions.amountMinor,
    categoryName: categories.name
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(and(eq(transactions.userId, userId), eq(transactions.type, 'expense')))
  .all();

  const grouped: { [key: string]: number } = {};
  for (const item of expList) {
    const cat = item.categoryName || 'Other';
    grouped[cat] = (grouped[cat] || 0) + toMajorUnits(item.amountMinor);
  }

  const summary = Object.entries(grouped).map(([category, amount]) => ({
    category,
    amount: Math.round(amount)
  }));

  res.json(summary);
});

// ── NET WORTH WATERFALL BRIDGE ──
analyticsRouter.get('/analytics/net-worth-waterfall', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const userId = req.user!.id;
  const userAccounts = db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false))).all();
  const txs = db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    categoryId: transactions.categoryId,
    categoryName: categories.name
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, userId))
  .all();

  const totalInflows = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + toMajorUnits(t.amountMinor), 0);
  const totalOutflows = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + toMajorUnits(t.amountMinor), 0);
  const currentNetWorth = userAccounts.reduce((sum, a) => {
    const isDebt = ['credit_card', 'loan', 'mortgage'].includes(a.type);
    const amt = toMajorUnits(a.currentBalanceMinor);
    return isDebt ? sum - amt : sum + amt;
  }, 0);

  const estimatedOpening = Math.max(0, currentNetWorth - totalInflows + totalOutflows);

  // Group inflows & outflows by category for granular waterfall steps
  const inflowBreakdown: { [cat: string]: number } = {};
  const outflowBreakdown: { [cat: string]: number } = {};
  for (const t of txs) {
    const cat = t.categoryName || (t.type === 'income' ? 'Direct Inflow' : 'Discretionary');
    const amt = toMajorUnits(t.amountMinor);
    if (t.type === 'income') {
      inflowBreakdown[cat] = (inflowBreakdown[cat] || 0) + amt;
    } else if (t.type === 'expense') {
      outflowBreakdown[cat] = (outflowBreakdown[cat] || 0) + amt;
    }
  }

  // Compile structured waterfall items
  const items: Array<{ name: string; type: 'base' | 'inflow' | 'outflow' | 'total'; amount: number }> = [
    { name: 'Opening Position', type: 'base', amount: Math.round(estimatedOpening) }
  ];
  Object.entries(inflowBreakdown).forEach(([k, v]) => {
    items.push({ name: `+ ${k}`, type: 'inflow', amount: Math.round(v) });
  });
  Object.entries(outflowBreakdown).forEach(([k, v]) => {
    items.push({ name: `- ${k}`, type: 'outflow', amount: Math.round(v) });
  });
  items.push({ name: 'Closing Net Worth', type: 'total', amount: Math.round(currentNetWorth) });

  res.json({
    openingNetWorth: Math.round(estimatedOpening),
    totalInflows: Math.round(totalInflows),
    totalOutflows: Math.round(totalOutflows),
    closingNetWorth: Math.round(currentNetWorth),
    items
  });
});
