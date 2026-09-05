import { toMinorUnits, toMajorUnits, addMoney, subtractMoney, allocateMoney } from './utils/money.js';
import { calculateFinancialHealth, detectSpendingAnomalies } from './modules/intelligence/financial-engine.js';
import { generateTransactionFingerprint } from './modules/imports/import-engine.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n--- 1. Testing FinTrack Money Arithmetic Engine ---');
// Major to minor units
assert(toMinorUnits(1250.50) === 125050, '₹1,250.50 converts to exactly 125050 minor units');
assert(toMinorUnits('₹1,250.50') === 125050, 'String "₹1,250.50" parses to exactly 125050 minor units');
assert(toMajorUnits(125050) === 1250.50, '125050 minor units converts to float 1250.50');

// Safe additions & subtractions
assert(addMoney(100050, 200025) === 300075, 'Integer minor addition 100050 + 200025 = 300075');
assert(subtractMoney(300075, 100050) === 200025, 'Integer minor subtraction 300075 - 100050 = 200025');

// Exact Penny-Allocation (zero penny loss)
const totalMinor = 10000; // ₹100.00
const splitRatios = [1, 1, 1]; // split 3 ways
const shares = allocateMoney(totalMinor, splitRatios);
assert(shares.length === 3, 'Split 3 ways produces 3 parts');
assert(shares.reduce((a, b) => a + b, 0) === totalMinor, 'Sum of allocated shares strictly equals original total (zero penny loss)');
assert(shares[0] === 3334 && shares[1] === 3333 && shares[2] === 3333, 'Proper penny round-off distribution (3334, 3333, 3333)');

console.log('\n--- 2. Testing Deterministic Financial Intelligence Engine ---');
const dummyAccounts = [
  { id: 'acc_check', type: 'checking', currentBalanceMinor: 20000000 }, // ₹2,00,000
  { id: 'acc_save', type: 'savings', currentBalanceMinor: 30000000 },  // ₹3,00,000
  { id: 'acc_card', type: 'credit_card', currentBalanceMinor: 5000000 } // ₹50,000 liability
];

const dummyTransactions = [
  { id: 't1', type: 'income', amountMinor: 15000000, date: new Date().toISOString(), description: 'Salary' },
  { id: 't2', type: 'expense', amountMinor: 4000000, date: new Date().toISOString(), description: 'Rent' },
  { id: 't3', type: 'expense', amountMinor: 2000000, date: new Date().toISOString(), description: 'Groceries' }
];

const dummyGoals = [
  { id: 'g1', title: 'Emergency Fund', targetAmountMinor: 30000000, currentAmountMinor: 21000000, targetDate: '2026-12-31' }
];

const health = calculateFinancialHealth(dummyAccounts, dummyTransactions, dummyGoals);

// Verify Net Worth: Assets (5,00,000) - Liabilities (50,000) = 4,50,000 minor
assert(health.summary.netWorthMinor === 45000000, 'Calculated Net Worth is exactly ₹4,50,000 (45,000,000 minor)');
assert(health.summary.liquidCashMinor === 50000000, 'Liquid cash is exactly ₹5,00,000');
assert(health.summary.monthlyIncomeMinor === 15000000, 'Monthly income is ₹1,50,000');
assert(health.summary.monthlyExpensesMinor === 6000000, 'Monthly expenses is ₹60,000');
assert(health.summary.netCashFlowMinor === 9000000, 'Net cash surplus is ₹90,000');
assert(health.summary.savingsRatePercent === 60, 'Savings rate is 60%');
assert(health.healthScore >= 70 && health.healthScore <= 100, `Health Score (${health.healthScore}) is within expected institutional range (70-100)`);
assert(health.dimensions.length === 7, '7 distinct mathematical dimensions computed');

console.log('\n--- 3. Testing Anomaly Detection & Cryptographic Fingerprinting ---');
const anomalyTxs = [
  { id: 'tx1', type: 'expense', amountMinor: 100000, date: new Date().toISOString(), description: 'Lunch' },
  { id: 'tx2', type: 'expense', amountMinor: 120000, date: new Date().toISOString(), description: 'Dinner' },
  { id: 'tx3', type: 'expense', amountMinor: 110000, date: new Date().toISOString(), description: 'Coffee' },
  { id: 'tx4', type: 'expense', amountMinor: 15000000, date: new Date().toISOString(), description: 'Jewellery Purchase' } // Outlier!
];

const detectedAnomalies = detectSpendingAnomalies(anomalyTxs);
assert(detectedAnomalies.length > 0, 'Detected outlier transaction');
assert(detectedAnomalies[0].transactionId === 'tx4', 'Identified Jewellery Purchase as the statistical outlier');

// Cryptographic duplicate fingerprint test
const fp1 = generateTransactionFingerprint('acc_1', '2026-09-01T10:00:00Z', 500000, 'AMAZON PAY');
const fp2 = generateTransactionFingerprint('acc_1', '2026-09-01T15:30:00Z', 500000, 'amazon pay ');
assert(fp1 === fp2, 'Fingerprints match across different times on same date & normalized description');

console.log('\n--- 4. Testing Merchant Normalization & Subscription Intelligence ---');
import { normalizeMerchant } from './modules/intelligence/merchant-normalizer.js';
import { detectSubscriptions } from './modules/intelligence/subscription-detector.js';
import { simulateFinancialScenario } from './modules/intelligence/scenario-engine.js';

const norm1 = normalizeMerchant('AMZN MKTP IN*948123');
assert(norm1.canonicalName === 'Amazon', 'Normalized "AMZN MKTP IN*948123" to "Amazon"');
assert(norm1.confidence >= 90, 'High confidence for known Amazon pattern');

const norm2 = normalizeMerchant('Netflix Entertainment Services');
assert(norm2.canonicalName === 'Netflix', 'Normalized "Netflix"');
assert(norm2.isSubscriptionCandidate === true, 'Flagged Netflix as a subscription candidate');

const dummySubExpenses = [
  { id: 's1', description: 'Netflix Premium Plan', amountMinor: 64900, date: '2026-07-05T00:00:00Z' },
  { id: 's2', description: 'Netflix Premium Plan', amountMinor: 64900, date: '2026-08-04T00:00:00Z' },
  { id: 's3', description: 'Spotify Individual', amountMinor: 11900, date: '2026-08-10T00:00:00Z' }
];

const subAnalysis = detectSubscriptions(dummySubExpenses);
assert(subAnalysis.subscriptions.length >= 2, 'Detected at least 2 recurring subscriptions');
assert(subAnalysis.totalMonthlyMinor === 76800, 'Calculated total monthly subscription load (₹768.00)');
assert(subAnalysis.totalAnnualMinor === 921600, 'Calculated total annual subscription load (₹9,216.00)');

console.log('\n--- 5. Testing Scenario Lab & Goal Planning Simulator ---');
const simResult = simulateFinancialScenario({
  baselineMonthlyIncome: 150000,
  baselineMonthlyExpenses: 70000,
  baselineLiquidCash: 350000,
  additionalMonthlySavings: 15000,
  expenseReductionPercent: 10, // cuts expenses by ₹7,000 to ₹63,000
  incomeChangePercent: 0,
  targetGoal: {
    id: 'g_car',
    title: 'Electric Vehicle Reserve',
    remainingAmount: 300000,
    currentMonthlyContribution: 10000,
    currentMonthsToTarget: 30
  }
});

assert(simResult.newMonthlyExpenses === 63000, '10% expense reduction cuts monthly expenses to ₹63,000');
assert(simResult.newRunwayMonths > simResult.baselineRunwayMonths, 'Reduced expenses increases cash runway');
assert(simResult.goalSimulation !== undefined && simResult.goalSimulation.monthsSaved > 0, 'Additional savings accelerates goal completion date');

console.log(`\n================================`);
console.log(`Test Execution Summary: ${passedTests} / ${totalTests} PASSED`);
console.log(`================================\n`);
