/**
 * FinTrack Money & Currency Engine
 * Strict integer minor-units representation (cents, paise).
 * Eliminates IEEE 754 floating-point rounding anomalies.
 */

export interface Money {
  amountMinor: number;
  currency: string;
}

/**
 * Converts a major unit currency amount (e.g., 1250.50) into integer minor units (e.g., 125050).
 */
export function toMinorUnits(amount: number | string, decimals: number = 2): number {
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * Math.pow(10, decimals));
  }
  if (isNaN(amount)) return 0;
  return Math.round(amount * Math.pow(10, decimals));
}

/**
 * Converts integer minor units back to major unit float for presentation (e.g., 125050 -> 1250.50).
 */
export function toMajorUnits(amountMinor: number | bigint, decimals: number = 2): number {
  const num = typeof amountMinor === 'bigint' ? Number(amountMinor) : amountMinor;
  return num / Math.pow(10, decimals);
}

/**
 * Formats minor units into an institutional, locale-aware currency string.
 */
export function formatMoney(
  amountMinor: number | bigint,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  const major = toMajorUnits(amountMinor);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    // Fallback if locale/currency combination fails
    return `${currency} ${major.toFixed(2)}`;
  }
}

/**
 * Safe integer additions.
 */
export function addMoney(a: number, b: number): number {
  return Math.trunc(a) + Math.trunc(b);
}

/**
 * Safe integer subtractions.
 */
export function subtractMoney(a: number, b: number): number {
  return Math.trunc(a) - Math.trunc(b);
}

/**
 * Multiplies an integer minor unit by a ratio or decimal multiplier with half-up rounding.
 */
export function multiplyMoney(amountMinor: number, factor: number): number {
  return Math.round(Math.trunc(amountMinor) * factor);
}

/**
 * Exact allocation algorithm (e.g. splitting ₹5,000 into 3 equal shares).
 * Guarantees that sum(results) === totalMinorUnits with zero penny loss.
 */
export function allocateMoney(totalMinor: number, ratios: number[]): number[] {
  if (ratios.length === 0) return [];
  const totalWeight = ratios.reduce((sum, r) => sum + r, 0);
  if (totalWeight <= 0) {
    throw new Error('Total allocation ratio weight must be greater than zero');
  }

  let remainder = totalMinor;
  const results: number[] = [];

  for (let i = 0; i < ratios.length; i++) {
    const share = Math.floor((totalMinor * ratios[i]) / totalWeight);
    results.push(share);
    remainder -= share;
  }

  // Distribute remaining cents/paise one by one to preserve total
  for (let i = 0; i < remainder; i++) {
    results[i % results.length]++;
  }

  return results;
}
