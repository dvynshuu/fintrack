import { Router, Response } from 'express';
import axios from 'axios';
import { db } from '../../db/index.js';
import { accounts, transactions, goals, categories } from '../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth.js';
import { calculateFinancialHealth, detectSpendingAnomalies } from '../intelligence/financial-engine.js';
import { toMajorUnits, formatMoney } from '../../utils/money.js';

export const aiRouter = Router();

// ── GET AI INSIGHTS & EXECUTIVE FINANCIAL BRIEF ──
aiRouter.post('/insights', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  // 1. Deterministic Data Pull
  const userAccounts = db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false))).all();
  const userTxs = db.select({
    id: transactions.id,
    type: transactions.type,
    amountMinor: transactions.amountMinor,
    currency: transactions.currency,
    date: transactions.date,
    description: transactions.description,
    categoryName: categories.name
  })
  .from(transactions)
  .leftJoin(categories, eq(transactions.categoryId, categories.id))
  .where(eq(transactions.userId, userId))
  .orderBy(desc(transactions.date))
  .limit(200)
  .all();

  const userGoals = db.select().from(goals).where(eq(goals.userId, userId)).all();

  // 2. Deterministic Health Score & Anomaly Computation (Never hallucinated)
  const health = calculateFinancialHealth(
    userAccounts.map(a => ({ id: a.id, type: a.type, currentBalanceMinor: a.currentBalanceMinor })),
    userTxs.map(t => ({ id: t.id, type: t.type, amountMinor: t.amountMinor, date: t.date, description: t.description, category: t.categoryName || undefined })),
    userGoals.map(g => ({ id: g.id, title: g.title, targetAmountMinor: g.targetAmountMinor, currentAmountMinor: g.currentAmountMinor, targetDate: g.targetDate }))
  );

  const anomalies = detectSpendingAnomalies(
    userTxs.map(t => ({ id: t.id, type: t.type, amountMinor: t.amountMinor, date: t.date, description: t.description }))
  );

  // 3. Compile Evidence-Backed Actionable Suggestions
  const smartSuggestions: any[] = [];

  // Suggestion 1: Savings Rate
  if (health.summary.savingsRatePercent >= 20) {
    smartSuggestions.push({
      title: 'Healthy Savings Rate',
      description: `Saving ${health.summary.savingsRatePercent}% of trailing net monthly income (${formatMoney(health.summary.netCashFlowMinor)} net surplus).`,
      type: 'saving',
      impact: 'high',
      action: { text: 'Allocate to Goals', link: '/goals' }
    });
  } else {
    smartSuggestions.push({
      title: 'Savings Trajectory Optimization',
      description: `Current savings velocity is at ${health.summary.savingsRatePercent}%. Targeting 20% would accumulate an additional ${formatMoney(Math.round(health.summary.monthlyIncomeMinor * 0.2))} monthly.`,
      type: 'alert',
      impact: 'high',
      action: { text: 'Review Expenses', link: '/expenses' }
    });
  }

  // Suggestion 2: Cash Runway / Safety Net
  if (health.summary.cashRunwayMonths < 3) {
    smartSuggestions.push({
      title: 'Capital Reserve Attention',
      description: `Liquid cash reserves cover ${health.summary.cashRunwayMonths} months of essential outflow. Target a minimum 3-6 month reserve.`,
      type: 'alert',
      impact: 'high',
      action: { text: 'Fund Emergency Goal', link: '/goals' }
    });
  } else {
    smartSuggestions.push({
      title: 'Resilient Liquid Buffer',
      description: `Your emergency buffer stands at ${health.summary.cashRunwayMonths} months of essential burn rate (${formatMoney(health.summary.liquidCashMinor)} liquid capital).`,
      type: 'milestone',
      impact: 'medium',
      action: { text: 'Inspect Net Worth', link: '/analytics' }
    });
  }

  // Suggestion 3: Anomalies Alert
  if (anomalies.length > 0) {
    smartSuggestions.push({
      title: 'Outlier Expenditure Detected',
      description: `${anomalies[0].description}: ${anomalies[0].reason}`,
      type: 'alert',
      impact: 'medium',
      action: { text: 'Inspect Ledger', link: '/expenses' }
    });
  }

  // Backward-compatible envelope
  res.json({
    healthScore: health.healthScore,
    financialHealth: {
      savingsRate: health.summary.savingsRatePercent,
      emergencyFund: Math.min(100, Math.round((health.summary.cashRunwayMonths / 6) * 100)),
      debtToIncome: Math.round(health.dimensions.find(d => d.name === 'Debt Load')?.score || 85),
      investmentGrowth: 18
    },
    smartSuggestions,
    dimensions: health.dimensions,
    metrics: {
      netWorth: toMajorUnits(health.summary.netWorthMinor),
      liquidCash: toMajorUnits(health.summary.liquidCashMinor),
      safeToSpend: toMajorUnits(health.summary.safeToSpendMinor),
      cashRunwayMonths: health.summary.cashRunwayMonths
    }
  });
});

// ── ASK FINTRACK: EVIDENCE-BASED NATURAL LANGUAGE QUERIES ──
aiRouter.post('/ai/ask', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Please provide a valid question string.' } });
    return;
  }

  // Fetch contextual facts from database
  const userAccounts = db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.isArchived, false))).all();
  const userTxs = db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date)).limit(200).all();
  const userGoals = db.select().from(goals).where(eq(goals.userId, userId)).all();

  const totalAssets = userAccounts.filter(a => !['credit_card', 'loan'].includes(a.type)).reduce((s, a) => s + toMajorUnits(a.currentBalanceMinor), 0);
  const totalDebt = userAccounts.filter(a => ['credit_card', 'loan'].includes(a.type)).reduce((s, a) => s + toMajorUnits(a.currentBalanceMinor), 0);
  const totalIncome = userTxs.filter(t => t.type === 'income').reduce((s, t) => s + toMajorUnits(t.amountMinor), 0);
  const totalExpenses = userTxs.filter(t => t.type === 'expense').reduce((s, t) => s + toMajorUnits(t.amountMinor), 0);

  const topCategories: { [k: string]: number } = {};
  for (const t of userTxs) {
    if (t.type === 'expense') {
      const desc = t.description;
      topCategories[desc] = (topCategories[desc] || 0) + toMajorUnits(t.amountMinor);
    }
  }

  const prompt = `
    You are FinTrack Institutional Strategist. Answer the user's question using ONLY the factual data below.
    FACTUAL LEDGER DATA:
    - Liquid & Total Assets: ₹${totalAssets}
    - Total Liabilities / Debt: ₹${totalDebt}
    - Net Worth: ₹${totalAssets - totalDebt}
    - Total Inflows: ₹${totalIncome}
    - Total Outflows: ₹${totalExpenses}
    - Accounts: ${userAccounts.map(a => `${a.name} (₹${toMajorUnits(a.currentBalanceMinor)})`).join(', ')}
    - Active Goals: ${userGoals.map(g => `${g.title}: ₹${toMajorUnits(g.currentAmountMinor)} / ₹${toMajorUnits(g.targetAmountMinor)}`).join(', ')}

    USER QUESTION: "${question}"

    Provide a concise, precise, professional financial response directly citing the numbers above.
  `;

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (apiKey && apiKey.startsWith('sk-or-')) {
    try {
      const response = await axios({
        method: 'post',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        },
        timeout: 10000
      });

      const answer = response.data.choices[0]?.message?.content;
      res.json({ answer, evidence: { totalAssets, totalDebt, totalIncome, totalExpenses } });
      return;
    } catch (err: any) {
      console.warn('OpenRouter call error:', err.message);
    }
  }

  // Deterministic local fallbacks for common queries
  const qLower = question.toLowerCase();
  let answer = `Based on your FinTrack ledger: Your net worth is ₹${totalAssets - totalDebt}, with ₹${totalAssets} in total assets and ₹${totalDebt} in liabilities. Total expenses stand at ₹${totalExpenses}.`;
  if (qLower.includes('how much') || qLower.includes('spend') || qLower.includes('expense')) {
    answer = `Your total recorded expenditure is ₹${totalExpenses.toLocaleString('en-IN')}, balanced against total income inflows of ₹${totalIncome.toLocaleString('en-IN')}.`;
  } else if (qLower.includes('runway') || qLower.includes('last') || qLower.includes('buffer')) {
    const monthlyBurn = totalExpenses > 0 ? totalExpenses : 30000;
    const months = (totalAssets / monthlyBurn).toFixed(1);
    answer = `With ₹${totalAssets.toLocaleString('en-IN')} in liquid assets and an estimated monthly burn rate of ₹${monthlyBurn.toLocaleString('en-IN')}, your cash runway is approximately ${months} months.`;
  }

  res.json({ answer, evidence: { totalAssets, totalDebt, totalIncome, totalExpenses } });
});
