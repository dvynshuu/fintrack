/**
 * FinTrack Merchant Normalization Pipeline
 * Converts raw, cryptic bank narrations into clean, canonical institutional merchants.
 */

export interface NormalizedMerchantResult {
  canonicalName: string;
  categorySuggestion: string;
  confidence: number; // 0 - 100
  isSubscriptionCandidate: boolean;
}

const KNOWN_MERCHANT_PATTERNS: {
  pattern: RegExp;
  canonicalName: string;
  category: string;
  isSubscription: boolean;
}[] = [
  { pattern: /amzn|amazon/i, canonicalName: 'Amazon', category: 'Shopping & Goods', isSubscription: false },
  { pattern: /netflix/i, canonicalName: 'Netflix', category: 'Entertainment & Media', isSubscription: true },
  { pattern: /spotify/i, canonicalName: 'Spotify', category: 'Entertainment & Media', isSubscription: true },
  { pattern: /uber/i, canonicalName: 'Uber', category: 'Transportation', isSubscription: false },
  { pattern: /ola\s*cabs|ani\s*tech/i, canonicalName: 'Ola', category: 'Transportation', isSubscription: false },
  { pattern: /swiggy/i, canonicalName: 'Swiggy', category: 'Food & Dining', isSubscription: false },
  { pattern: /zomato/i, canonicalName: 'Zomato', category: 'Food & Dining', isSubscription: false },
  { pattern: /starbucks|tata\s*starbucks/i, canonicalName: 'Starbucks', category: 'Food & Dining', isSubscription: false },
  { pattern: /apple(\.com|\s*store|\s*services)?/i, canonicalName: 'Apple', category: 'Entertainment & Media', isSubscription: true },
  { pattern: /google(\s*play|\s*cloud|\s*storage|\s*youtube)?/i, canonicalName: 'Google', category: 'Utilities & Bills', isSubscription: true },
  { pattern: /github/i, canonicalName: 'GitHub', category: 'Utilities & Bills', isSubscription: true },
  { pattern: /adobe/i, canonicalName: 'Adobe', category: 'Education & Learning', isSubscription: true },
  { pattern: /airtel|jio|vodafone|vi\s*bill/i, canonicalName: 'Telecom Services', category: 'Utilities & Bills', isSubscription: true },
  { pattern: /electricity|power\s*dist|bescom|mseb|cesc/i, canonicalName: 'Electricity Utility', category: 'Utilities & Bills', isSubscription: true },
  { pattern: /zerodha|groww|upstox|indmoney/i, canonicalName: 'Investment Brokerage', category: 'Dividends & Capital Gains', isSubscription: false },
  { pattern: /salary|payroll|direct\s*dep/i, canonicalName: 'Employer Payroll', category: 'Salary & Wages', isSubscription: false }
];

/**
 * Cleans and normalizes a raw narration string.
 */
export function normalizeMerchant(rawDescription: string): NormalizedMerchantResult {
  const cleaned = rawDescription.trim().replace(/\s+/g, ' ');

  for (const item of KNOWN_MERCHANT_PATTERNS) {
    if (item.pattern.test(cleaned)) {
      return {
        canonicalName: item.canonicalName,
        categorySuggestion: item.category,
        confidence: 95,
        isSubscriptionCandidate: item.isSubscription
      };
    }
  }

  // Fallback heuristic: strip common transaction noise (pos*, vpa*, in*, numbers)
  const stripped = cleaned
    .replace(/^(pos|vpa|neft|rtgs|imps|upi|ach|dr|cr)[-/\s*]+/i, '')
    .replace(/[*#]\d+/g, '')
    .trim();

  const titleCase = stripped.charAt(0).toUpperCase() + stripped.slice(1);

  return {
    canonicalName: titleCase || 'General Merchant',
    categorySuggestion: 'Other',
    confidence: 60,
    isSubscriptionCandidate: false
  };
}
