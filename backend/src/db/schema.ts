import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ── USERS TABLE ──
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  profilePicture: text('profile_picture'),
  phone: text('phone'),
  location: text('location'),
  currency: text('currency').default('INR').notNull(),
  language: text('language').default('en').notNull(),
  role: text('role').default('user').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── ACCOUNTS TABLE ──
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // checking, savings, credit_card, cash, investment, loan, mortgage
  institution: text('institution'),
  accountNumberMask: text('account_number_mask'),
  currency: text('currency').default('INR').notNull(),
  openingBalanceMinor: integer('opening_balance_minor').default(0).notNull(),
  currentBalanceMinor: integer('current_balance_minor').default(0).notNull(),
  availableBalanceMinor: integer('available_balance_minor').default(0).notNull(),
  color: text('color').default('#10B981'),
  icon: text('icon').default('wallet'),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── CATEGORIES TABLE ──
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // null for system defaults
  name: text('name').notNull(),
  type: text('type').notNull(), // income, expense, transfer
  icon: text('icon').default('tag'),
  color: text('color').default('#64748B'),
  parentId: text('parent_id'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── MERCHANTS TABLE ──
export const merchants = sqliteTable('merchants', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  defaultCategoryId: text('default_category_id').references(() => categories.id),
  logoUrl: text('logo_url'),
  website: text('website'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── TRANSACTIONS TABLE ──
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // expense, income, transfer, refund, fee, adjustment
  status: text('status').default('posted').notNull(), // pending, posted, reconciled, voided, deleted
  amountMinor: integer('amount_minor').notNull(), // Always positive; sign dictated by type/ledger
  currency: text('currency').default('INR').notNull(),
  date: text('date').notNull(), // ISO-8601 (YYYY-MM-DDTHH:mm:ss)
  description: text('description').notNull(),
  rawDescription: text('raw_description'),
  merchantId: text('merchant_id').references(() => merchants.id),
  categoryId: text('category_id').references(() => categories.id),
  transferId: text('transfer_id'),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false).notNull(),
  notes: text('notes'),
  fingerprint: text('fingerprint'), // SHA256 duplicate detection fingerprint
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── TRANSACTION ENTRIES (DOUBLE-ENTRY LEDGER) ──
export const transactionEntries = sqliteTable('transaction_entries', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  entryType: text('entry_type').notNull(), // debit, credit
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').default('INR').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── TRANSFERS TABLE ──
export const transfers = sqliteTable('transfers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sourceAccountId: text('source_account_id').notNull().references(() => accounts.id),
  destinationAccountId: text('destination_account_id').notNull().references(() => accounts.id),
  sourceTransactionId: text('source_transaction_id').notNull(),
  destinationTransactionId: text('destination_transaction_id').notNull(),
  amountMinor: integer('amount_minor').notNull(),
  currency: text('currency').default('INR').notNull(),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── BUDGETS TABLE ──
export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  amountMinor: integer('amount_minor').notNull(),
  period: text('period').default('monthly').notNull(), // monthly, annual
  alertThreshold: real('alert_threshold').default(0.85).notNull(), // 85%
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── GOALS TABLE ──
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').default('savings').notNull(), // emergency, purchase, travel, education, milestone
  targetAmountMinor: integer('target_amount_minor').notNull(),
  currentAmountMinor: integer('current_amount_minor').default(0).notNull(),
  targetDate: text('target_date').notNull(),
  linkedAccountId: text('linked_account_id').references(() => accounts.id),
  status: text('status').default('in_progress').notNull(), // not_started, in_progress, completed, paused
  priority: text('priority').default('medium').notNull(), // low, medium, high
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── RECURRING TRANSACTIONS / SUBSCRIPTIONS ──
export const recurringTransactions = sqliteTable('recurring_transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id),
  merchantId: text('merchant_id').references(() => merchants.id),
  categoryId: text('category_id').references(() => categories.id),
  name: text('name').notNull(),
  expectedAmountMinor: integer('expected_amount_minor').notNull(),
  currency: text('currency').default('INR').notNull(),
  frequency: text('frequency').default('monthly').notNull(), // weekly, monthly, quarterly, annual
  nextDueDate: text('next_due_date').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── STATEMENTS & RECONCILIATIONS ──
export const reconciliations = sqliteTable('reconciliations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id),
  statementDate: text('statement_date').notNull(),
  statementBalanceMinor: integer('statement_balance_minor').notNull(),
  fintrackBalanceMinor: integer('fintrack_balance_minor').notNull(),
  differenceMinor: integer('difference_minor').notNull(),
  status: text('status').default('unbalanced').notNull(), // balanced, unbalanced
  closedAt: text('closed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── HISTORICAL NET WORTH SNAPSHOTS ──
export const netWorthSnapshots = sqliteTable('net_worth_snapshots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  totalAssetsMinor: integer('total_assets_minor').notNull(),
  totalLiabilitiesMinor: integer('total_liabilities_minor').notNull(),
  netWorthMinor: integer('net_worth_minor').notNull(),
  liquidAssetsMinor: integer('liquid_assets_minor').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── AUDIT EVENTS ──
export const auditEvents = sqliteTable('audit_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // create, update, delete, reconcile, import
  entityType: text('entity_type').notNull(), // transaction, account, goal, user
  entityId: text('entity_id').notNull(),
  payloadSummary: text('payload_summary'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── RULES ENGINE ──
export const rules = sqliteTable('rules', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  matchField: text('match_field').notNull(), // description, merchant, amount
  matchType: text('match_type').notNull(), // contains, exact, starts_with
  matchValue: text('match_value').notNull(),
  targetCategoryId: text('target_category_id').references(() => categories.id),
  targetMerchantId: text('target_merchant_id').references(() => merchants.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull()
});

// ── RELATIONS ──
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  goals: many(goals),
  budgets: many(budgets),
  netWorthSnapshots: many(netWorthSnapshots)
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions),
  entries: many(transactionEntries)
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
  merchant: one(merchants, { fields: [transactions.merchantId], references: [merchants.id] }),
  entries: many(transactionEntries)
}));
