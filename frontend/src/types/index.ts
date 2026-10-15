// FinTrack Domain Models and Type Definitions

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  phone?: string | null;
  location?: string | null;
  currency?: string;
  language?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (userData: RegisterPayload) => Promise<User>;
  logout: () => void;
}

export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit_card'
  | 'cash'
  | 'investment'
  | 'loan'
  | 'mortgage'
  | string;

export interface Account {
  id: string;
  userId?: string;
  name: string;
  type: AccountType;
  institution?: string | null;
  accountNumberMask?: string | null;
  currency?: string;
  openingBalanceMinor?: number;
  currentBalanceMinor?: number;
  availableBalanceMinor?: number;
  currentBalance?: number;
  color?: string;
  icon?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer' | 'refund' | 'fee' | 'adjustment' | string;
export type TransactionStatus = 'pending' | 'posted' | 'reconciled' | 'voided' | 'deleted' | string;

export interface Transaction {
  id: string;
  _id?: string;
  userId?: string;
  accountId?: string;
  type: TransactionType;
  status?: TransactionStatus;
  amountMinor?: number;
  amount: number;
  currency?: string;
  date: string;
  description: string;
  title?: string;
  rawDescription?: string;
  merchantId?: string;
  categoryId?: string;
  category?: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface Expense {
  _id?: string;
  id?: string;
  title?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Income {
  _id?: string;
  id?: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  isSystem?: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  normalizedName: string;
  logoUrl?: string;
}

export interface TransferPayload {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date: string;
  description?: string;
  fee?: number;
}

export interface Goal {
  id: string;
  _id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetAmountMinor?: number;
  currentAmountMinor?: number;
  progress?: number;
  targetDate: string;
  deadline?: string;
  type?: string;
  category?: string;
  status?: string;
  description?: string;
  createdAt?: string;
}

export interface HealthScoreDimension {
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
  calculation: string;
  evidence: string;
}

export interface FinancialHealthSummary {
  netWorthMinor: number;
  liquidCashMinor: number;
  monthlyIncomeMinor: number;
  monthlyExpensesMinor: number;
  netCashFlowMinor: number;
  savingsRatePercent: number;
  safeToSpendMinor: number;
  cashRunwayMonths: number;
  emergencyFundMonths?: number;
}

export interface FinancialHealthResult {
  healthScore: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' | 'Awaiting Data' | string;
  dimensions: HealthScoreDimension[];
  summary: FinancialHealthSummary;
}

export interface DashboardPosition {
  netWorth: number;
  liquidCash: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  savingsRatePercent: number;
  safeToSpend: number;
  cashRunwayMonths: number;
}

export interface SpendingAnomaly {
  transactionId: string;
  description: string;
  amount: number;
  amountMinor?: number;
  severity?: 'low' | 'medium' | 'high' | string;
  reason?: string;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyTimeline {
  month: string;
  income: number;
  expenses: number;
}

export interface DashboardSummary {
  health: FinancialHealthResult;
  position: DashboardPosition;
  anomalies: SpendingAnomaly[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyTimeline: MonthlyTimeline[];
  recentTransactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
}

export interface Subscription {
  id: string;
  merchant: string;
  name?: string;
  amount: number;
  cycle: string;
  frequency?: string;
  nextDate?: string;
  category?: string;
  isReviewFlagged?: boolean;
  active?: boolean;
}

export interface NetWorthPoint {
  month: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (data: Partial<Expense>) => Promise<any>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<any>;
  deleteExpense: (id: string) => Promise<void>;
}

export interface FinancialHealthIndicators {
  savingsRate: number;
  emergencyFund: number;
  debtToIncome: number;
  investmentGrowth: number;
}

export interface SmartSuggestion {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  impact?: string;
  recommendation?: string;
}

export interface AiData {
  healthScore: number;
  financialHealth: FinancialHealthIndicators;
  smartSuggestions: SmartSuggestion[];
  [key: string]: any;
}

export interface InsightsContextType {
  aiData: AiData;
  loading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
}

export interface ThemeContextType {
  theme: string;
  toggleTheme: (newTheme: string) => Promise<void>;
}

export interface ProfileData {
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  currency?: string;
  language?: string;
  notifications?: boolean;
}

export interface UserSettings {
  theme: string;
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  display: {
    dateFormat: string;
    timeFormat: string;
  };
}
