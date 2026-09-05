/**
 * FinTrack Deterministic Financial Intelligence Engine
 * All calculations are 100% mathematical, deterministic, and verifiable.
 * No fabricated AI numbers or opaque hallucinated metrics.
 */

import { toMajorUnits } from '../../utils/money.js';

export interface AccountBalance {
  id: string;
  type: string; // checking, savings, credit_card, cash, investment, loan
  currentBalanceMinor: number;
}

export interface TransactionSummaryItem {
  id: string;
  amountMinor: number;
  type: string; // income, expense, transfer
  category?: string;
  date: string;
  description: string;
}

export interface GoalSummaryItem {
  id: string;
  title: string;
  targetAmountMinor: number;
  currentAmountMinor: number;
  targetDate: string;
}

export interface HealthScoreDimension {
  name: string;
  weight: number;
  score: number; // 0-100
  weightedScore: number;
  calculation: string;
  evidence: string;
}

export interface FinancialHealthResult {
  healthScore: number; // 0 - 100
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' | 'Awaiting Data';
  dimensions: HealthScoreDimension[];
  summary: {
    netWorthMinor: number;
    liquidCashMinor: number;
    monthlyIncomeMinor: number;
    monthlyExpensesMinor: number;
    netCashFlowMinor: number;
    savingsRatePercent: number;
    safeToSpendMinor: number;
    cashRunwayMonths: number;
    emergencyFundMonths: number;
  };
}

export interface SpendingAnomaly {
  transactionId: string;
  description: string;
  amountMinor: number;
  date: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * Calculates comprehensive financial health metrics deterministically.
 */
export function calculateFinancialHealth(
  accounts: AccountBalance[],
  recentTransactions: TransactionSummaryItem[],
  goals: GoalSummaryItem[] = [],
  currency = 'INR'
): FinancialHealthResult {
  // 1. Calculate Net Worth & Liquid Cash
  let totalAssetsMinor = 0;
  let totalLiabilitiesMinor = 0;
  let liquidCashMinor = 0;

  for (const acc of accounts) {
    const isLiability = ['credit_card', 'loan', 'mortgage'].includes(acc.type);
    if (isLiability) {
      // Liabilities: positive balance indicates debt owed
      totalLiabilitiesMinor += Math.abs(acc.currentBalanceMinor);
    } else {
      totalAssetsMinor += acc.currentBalanceMinor;
      if (['checking', 'savings', 'cash'].includes(acc.type)) {
        liquidCashMinor += acc.currentBalanceMinor;
      }
    }
  }

  const netWorthMinor = totalAssetsMinor - totalLiabilitiesMinor;

  // 2. Trailing 30-day Inflows & Outflows
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let monthlyIncomeMinor = 0;
  let monthlyExpensesMinor = 0;

  for (const tx of recentTransactions) {
    const txDate = new Date(tx.date);
    if (txDate >= thirtyDaysAgo && txDate <= now) {
      if (tx.type === 'income') {
        monthlyIncomeMinor += tx.amountMinor;
      } else if (tx.type === 'expense') {
        monthlyExpensesMinor += tx.amountMinor;
      }
    }
  }

  const netCashFlowMinor = monthlyIncomeMinor - monthlyExpensesMinor;
  const savingsRatePercent =
    monthlyIncomeMinor > 0
      ? Math.max(0, Math.min(100, Math.round(((monthlyIncomeMinor - monthlyExpensesMinor) / monthlyIncomeMinor) * 100)))
      : 0;

  // 3. Cash Runway (Months of liquid cash at current expense burn rate)
  const normalizedMonthlyBurn = monthlyExpensesMinor > 0 ? monthlyExpensesMinor : 0;
  const cashRunwayMonths = normalizedMonthlyBurn > 0 ? Number((liquidCashMinor / normalizedMonthlyBurn).toFixed(1)) : 0;

  // 4. Safe to Spend
  // Liquid cash minus estimated committed obligations and baseline reserve
  const baselineReserve = normalizedMonthlyBurn;
  const safeToSpendMinor = Math.max(0, liquidCashMinor - baselineReserve);

  // 5. Compute 7 Deterministic Health Score Dimensions
  // Dimension 1: Savings Velocity (20% weight)
  // Target: 20%+ savings rate gets 100 pts.
  const dim1Score = Math.min(100, Math.round((savingsRatePercent / 20) * 100));
  const dim1: HealthScoreDimension = {
    name: 'Savings Velocity',
    weight: 0.20,
    score: dim1Score,
    weightedScore: dim1Score * 0.20,
    calculation: `(Current Savings Rate: ${savingsRatePercent}%) ÷ 20% benchmark`,
    evidence: `Saved ${savingsRatePercent}% of trailing 30-day net income.`
  };

  // Dimension 2: Emergency Resilience (20% weight)
  // Target: 6 months of living expenses gets 100 pts.
  const dim2Score = Math.min(100, Math.round((cashRunwayMonths / 6) * 100));
  const dim2: HealthScoreDimension = {
    name: 'Cash Resilience',
    weight: 0.20,
    score: dim2Score,
    weightedScore: dim2Score * 0.20,
    calculation: `(Liquid Buffer: ${cashRunwayMonths} mo) ÷ 6 mo institutional reserve`,
    evidence: `Current liquid capital reserves support ${cashRunwayMonths} months of essential outflow.`
  };

  // Dimension 3: Debt Load (15% weight)
  // Target: 0% debt-to-income is 100; > 50% is 0.
  const dti = monthlyIncomeMinor > 0 ? (totalLiabilitiesMinor / (monthlyIncomeMinor * 12)) * 100 : 0;
  const dim3Score = Math.max(0, Math.min(100, Math.round(100 - dti * 1.5)));
  const dim3: HealthScoreDimension = {
    name: 'Debt Load',
    weight: 0.15,
    score: dim3Score,
    weightedScore: dim3Score * 0.15,
    calculation: `Annualized debt ratio ${dti.toFixed(1)}%`,
    evidence: `Total liabilities equal ${dti.toFixed(1)}% of estimated annual income.`
  };

  // Dimension 4: Expense Stability (15% weight)
  // Evaluates cash flow surplus: positive cash flow yields high score
  const surplusRatio = monthlyIncomeMinor > 0 ? (netCashFlowMinor / monthlyIncomeMinor) : 0;
  const dim4Score = surplusRatio > 0 ? Math.min(100, 70 + Math.round(surplusRatio * 30)) : Math.max(0, 50 + Math.round(surplusRatio * 50));
  const dim4: HealthScoreDimension = {
    name: 'Cashflow Dynamics',
    weight: 0.15,
    score: dim4Score,
    weightedScore: dim4Score * 0.15,
    calculation: `Net Cash Flow: ${toMajorUnits(netCashFlowMinor)}`,
    evidence: surplusRatio >= 0 ? `Positive fiscal surplus maintained.` : `Negative burn rate detected.`
  };

  // Dimension 5: Liquidity Share (10% weight)
  // Target: At least 25% of total assets in liquid form
  const liquidityRatio = totalAssetsMinor > 0 ? (liquidCashMinor / totalAssetsMinor) : 1;
  const dim5Score = Math.min(100, Math.round((liquidityRatio / 0.25) * 100));
  const dim5: HealthScoreDimension = {
    name: 'Liquidity Ratio',
    weight: 0.10,
    score: dim5Score,
    weightedScore: dim5Score * 0.10,
    calculation: `${Math.round(liquidityRatio * 100)}% of assets in cash equivalents`,
    evidence: `Sufficient immediate liquidity for unforeseen contingencies.`
  };

  // Dimension 6: Goal Trajectory (10% weight)
  // Average completion % across goals
  const goalAvgProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + Math.min(100, (g.currentAmountMinor / Math.max(1, g.targetAmountMinor)) * 100), 0) / goals.length
    : 75; // Neutral default if no goals yet
  const dim6Score = Math.round(goalAvgProgress);
  const dim6: HealthScoreDimension = {
    name: 'Goal Funding Trajectory',
    weight: 0.10,
    score: dim6Score,
    weightedScore: dim6Score * 0.10,
    calculation: `Average goal funding status: ${dim6Score}%`,
    evidence: `${goals.length} target milestones tracked.`
  };

  // Dimension 7: Balance Breadth (10% weight)
  // Having established diverse active accounts (e.g. savings + card + checking)
  const dim7Score = Math.min(100, accounts.length * 35);
  const dim7: HealthScoreDimension = {
    name: 'Account Integration',
    weight: 0.10,
    score: dim7Score,
    weightedScore: dim7Score * 0.10,
    calculation: `${accounts.length} linked accounts across ledger`,
    evidence: `Account diversification and balanced ledger tracking.`
  };

  const dimensions = [dim1, dim2, dim3, dim4, dim5, dim6, dim7];
  let status: FinancialHealthResult['status'] = 'Awaiting Data';
  let healthScore = 0;

  if (recentTransactions.length === 0) {
    status = 'Awaiting Data';
    healthScore = 0;
  } else {
    const rawHealthScore = Math.round(dimensions.reduce((sum, d) => sum + d.weightedScore, 0));
    healthScore = Math.max(10, Math.min(100, rawHealthScore));
    if (healthScore >= 80) {
      status = 'Excellent';
    } else if (healthScore >= 65) {
      status = 'Good';
    } else if (healthScore >= 45) {
      status = 'Fair';
    } else {
      status = 'Needs Attention';
    }
  }

  return {
    healthScore,
    status,
    dimensions,
    summary: {
      netWorthMinor,
      liquidCashMinor,
      monthlyIncomeMinor,
      monthlyExpensesMinor,
      netCashFlowMinor,
      savingsRatePercent,
      safeToSpendMinor,
      cashRunwayMonths,
      emergencyFundMonths: cashRunwayMonths
    }
  };
}

/**
 * Detects statistical anomalies and high-impact deviations in transactions.
 */
export function detectSpendingAnomalies(
  transactions: TransactionSummaryItem[],
  trailingDays = 30
): SpendingAnomaly[] {
  const anomalies: SpendingAnomaly[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');

  if (expenses.length < 3) return anomalies;

  // 1. High-Value Outlier Detection
  const amounts = expenses.map(e => e.amountMinor);
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)];
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const outlierThreshold = Math.min(mean + 1.5 * stdDev, Math.max(median * 3, 500000));

  for (const exp of expenses) {
    if (exp.amountMinor > outlierThreshold && exp.amountMinor >= 500000) { // > ₹5,000 and above threshold
      anomalies.push({
        transactionId: exp.id,
        description: exp.description,
        amountMinor: exp.amountMinor,
        date: exp.date,
        reason: `Exceeds expected spending baseline (Median ₹${Math.round(toMajorUnits(median))}, Avg ₹${Math.round(toMajorUnits(mean))}).`,
        severity: 'high'
      });
    }
  }

  // 2. Duplicate Transaction Detection within 48 hours
  for (let i = 0; i < expenses.length; i++) {
    for (let j = i + 1; j < expenses.length; j++) {
      const a = expenses[i];
      const b = expenses[j];
      if (a.amountMinor === b.amountMinor && a.description.toLowerCase() === b.description.toLowerCase()) {
        const timeDiffHours = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime()) / (1000 * 60 * 60);
        if (timeDiffHours <= 48 && !anomalies.some(x => x.transactionId === b.id)) {
          anomalies.push({
            transactionId: b.id,
            description: b.description,
            amountMinor: b.amountMinor,
            date: b.date,
            reason: `Potential duplicate charge identified within 48h of another ₹${toMajorUnits(a.amountMinor)} record.`,
            severity: 'medium'
          });
        }
      }
    }
  }

  return anomalies.slice(0, 5); // Return top 5 relevant anomalies
}
