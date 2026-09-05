import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database storage file path
const dbPath = path.resolve(__dirname, '../../../fintrack.db');
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

/**
 * Ensures all relational tables exist and default seed categories are populated.
 */
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      profile_picture TEXT,
      phone TEXT,
      location TEXT,
      currency TEXT NOT NULL DEFAULT 'INR',
      language TEXT NOT NULL DEFAULT 'en',
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      institution TEXT,
      account_number_mask TEXT,
      currency TEXT NOT NULL DEFAULT 'INR',
      opening_balance_minor INTEGER NOT NULL DEFAULT 0,
      current_balance_minor INTEGER NOT NULL DEFAULT 0,
      available_balance_minor INTEGER NOT NULL DEFAULT 0,
      color TEXT DEFAULT '#10B981',
      icon TEXT DEFAULT 'wallet',
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT DEFAULT 'tag',
      color TEXT DEFAULT '#64748B',
      parent_id TEXT,
      is_system INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      default_category_id TEXT REFERENCES categories(id),
      logo_url TEXT,
      website TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'posted',
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      raw_description TEXT,
      merchant_id TEXT REFERENCES merchants(id),
      category_id TEXT REFERENCES categories(id),
      transfer_id TEXT,
      is_recurring INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      fingerprint TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transaction_entries (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      entry_type TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      source_account_id TEXT NOT NULL REFERENCES accounts(id),
      destination_account_id TEXT NOT NULL REFERENCES accounts(id),
      source_transaction_id TEXT NOT NULL,
      destination_transaction_id TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      amount_minor INTEGER NOT NULL,
      period TEXT NOT NULL DEFAULT 'monthly',
      alert_threshold REAL NOT NULL DEFAULT 0.85,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'savings',
      target_amount_minor INTEGER NOT NULL,
      current_amount_minor INTEGER NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      linked_account_id TEXT REFERENCES accounts(id),
      status TEXT NOT NULL DEFAULT 'in_progress',
      priority TEXT NOT NULL DEFAULT 'medium',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      merchant_id TEXT REFERENCES merchants(id),
      category_id TEXT REFERENCES categories(id),
      name TEXT NOT NULL,
      expected_amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      frequency TEXT NOT NULL DEFAULT 'monthly',
      next_due_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reconciliations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL REFERENCES accounts(id),
      statement_date TEXT NOT NULL,
      statement_balance_minor INTEGER NOT NULL,
      fintrack_balance_minor INTEGER NOT NULL,
      difference_minor INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'unbalanced',
      closed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS net_worth_snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      total_assets_minor INTEGER NOT NULL,
      total_liabilities_minor INTEGER NOT NULL,
      net_worth_minor INTEGER NOT NULL,
      liquid_assets_minor INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload_summary TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_field TEXT NOT NULL,
      match_type TEXT NOT NULL,
      match_value TEXT NOT NULL,
      target_category_id TEXT REFERENCES categories(id),
      target_merchant_id TEXT REFERENCES merchants(id),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Indices for high-frequency queries
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transaction_entries_tx ON transaction_entries(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
  `);

  // Seed default system categories if missing
  const count = sqlite.prepare('SELECT count(*) as count FROM categories WHERE is_system = 1').get() as { count: number };
  if (count.count === 0) {
    const defaultCategories = [
      { id: 'cat_food', name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#10B981' },
      { id: 'cat_housing', name: 'Housing & Rent', type: 'expense', icon: 'home', color: '#38BDF8' },
      { id: 'cat_transport', name: 'Transportation', type: 'expense', icon: 'car', color: '#F59E0B' },
      { id: 'cat_shopping', name: 'Shopping & Goods', type: 'expense', icon: 'shopping-bag', color: '#6366F1' },
      { id: 'cat_health', name: 'Healthcare & Medical', type: 'expense', icon: 'heartbeat', color: '#F43F5E' },
      { id: 'cat_entertain', name: 'Entertainment & Media', type: 'expense', icon: 'gamepad', color: '#A855F7' },
      { id: 'cat_edu', name: 'Education & Learning', type: 'expense', icon: 'graduation-cap', color: '#14B8A6' },
      { id: 'cat_travel', name: 'Travel & Vacation', type: 'expense', icon: 'plane', color: '#EC4899' },
      { id: 'cat_utils', name: 'Utilities & Bills', type: 'expense', icon: 'bolt', color: '#EAB308' },
      { id: 'cat_salary', name: 'Salary & Wages', type: 'income', icon: 'money-bill', color: '#10B981' },
      { id: 'cat_consulting', name: 'Consulting & Freelance', type: 'income', icon: 'briefcase', color: '#38BDF8' },
      { id: 'cat_investments', name: 'Dividends & Capital Gains', type: 'income', icon: 'chart-line', color: '#F59E0B' },
      { id: 'cat_transfer', name: 'Account Transfer', type: 'transfer', icon: 'arrow-right-left', color: '#94A3B8' }
    ];

    const insertCat = sqlite.prepare(`
      INSERT INTO categories (id, user_id, name, type, icon, color, is_system)
      VALUES (@id, NULL, @name, @type, @icon, @color, 1)
    `);

    for (const cat of defaultCategories) {
      insertCat.run(cat);
    }
  }
}
