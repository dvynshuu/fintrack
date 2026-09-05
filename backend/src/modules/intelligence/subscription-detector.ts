import { normalizeMerchant } from './merchant-normalizer.js';
import { toMajorUnits } from '../../utils/money.js';

export interface DetectedSubscription {
  id: string;
  name: string;
  category: string;
  typicalAmountMinor: number;
  typicalAmount: number;
  frequency: 'monthly' | 'annual' | 'weekly';
  lastChargeDate: string;
  nextExpectedDate: string;
  annualCostMinor: number;
  annualCost: number;
  occurrenceCount: number;
  confidence: number; // 0 - 100
}

export interface SubscriptionAnalysisResult {
  totalMonthlyMinor: number;
  totalMonthly: number;
  totalAnnualMinor: number;
  totalAnnual: number;
  subscriptions: DetectedSubscription[];
}

export interface ExpenseItem {
  id: string;
  description: string;
  amountMinor: number;
  date: string;
  category?: string;
}

/**
 * Deterministically scans expense history for recurring subscriptions and periodic charges.
 */
export function detectSubscriptions(expenses: ExpenseItem[]): SubscriptionAnalysisResult {
  // Group expenses by normalized merchant name
  const merchantGroups: { [merchant: string]: ExpenseItem[] } = {};

  for (const exp of expenses) {
    const norm = normalizeMerchant(exp.description);
    const key = norm.canonicalName;
    if (!merchantGroups[key]) merchantGroups[key] = [];
    merchantGroups[key].push(exp);
  }

  const subscriptions: DetectedSubscription[] = [];

  for (const [merchant, group] of Object.entries(merchantGroups)) {
    // Sort ascending by date
    group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const normMeta = normalizeMerchant(merchant);

    // Case 1: Known subscription service with at least 1 record
    if (normMeta.isSubscriptionCandidate && group.length >= 1) {
      const latest = group[group.length - 1];
      const typicalMinor = latest.amountMinor;
      const lastDate = new Date(latest.date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 30);

      subscriptions.push({
        id: `sub_${merchant.toLowerCase().replace(/\s+/g, '_')}`,
        name: merchant,
        category: normMeta.categorySuggestion,
        typicalAmountMinor: typicalMinor,
        typicalAmount: toMajorUnits(typicalMinor),
        frequency: 'monthly',
        lastChargeDate: latest.date,
        nextExpectedDate: nextDate.toISOString(),
        annualCostMinor: typicalMinor * 12,
        annualCost: toMajorUnits(typicalMinor * 12),
        occurrenceCount: group.length,
        confidence: 95
      });
      continue;
    }

    // Case 2: At least 2 transactions with interval between 25 and 35 days (Monthly cadence)
    if (group.length >= 2) {
      let isCadence = false;
      for (let i = 1; i < group.length; i++) {
        const prev = new Date(group[i - 1].date);
        const curr = new Date(group[i].date);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        const amountDiffRatio = Math.abs(group[i].amountMinor - group[i - 1].amountMinor) / Math.max(1, group[i - 1].amountMinor);

        // Near-identical amount (<= 5% variance) and roughly monthly (25-35 days)
        if (diffDays >= 25 && diffDays <= 35 && amountDiffRatio <= 0.05) {
          isCadence = true;
          break;
        }
      }

      if (isCadence) {
        const latest = group[group.length - 1];
        const typicalMinor = latest.amountMinor;
        const lastDate = new Date(latest.date);
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 30);

        subscriptions.push({
          id: `sub_${merchant.toLowerCase().replace(/\s+/g, '_')}`,
          name: merchant,
          category: normMeta.categorySuggestion,
          typicalAmountMinor: typicalMinor,
          typicalAmount: toMajorUnits(typicalMinor),
          frequency: 'monthly',
          lastChargeDate: latest.date,
          nextExpectedDate: nextDate.toISOString(),
          annualCostMinor: typicalMinor * 12,
          annualCost: toMajorUnits(typicalMinor * 12),
          occurrenceCount: group.length,
          confidence: 85
        });
      }
    }
  }

  // Calculate totals
  const totalMonthlyMinor = subscriptions.reduce((sum, s) => sum + s.typicalAmountMinor, 0);
  const totalAnnualMinor = subscriptions.reduce((sum, s) => sum + s.annualCostMinor, 0);

  // Sort by highest monthly cost descending
  subscriptions.sort((a, b) => b.typicalAmountMinor - a.typicalAmountMinor);

  return {
    totalMonthlyMinor,
    totalMonthly: toMajorUnits(totalMonthlyMinor),
    totalAnnualMinor,
    totalAnnual: toMajorUnits(totalAnnualMinor),
    subscriptions
  };
}
