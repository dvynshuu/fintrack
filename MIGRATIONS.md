# FinTrack Schema Migration & Upgrade Guide

## 1. Migration from MongoDB / In-Memory to Ledger-First Relational Model

The legacy system utilized two disconnected Mongoose collections: `Expense` and `Income`, with IEEE-754 floating-point amounts and no account entities.

### Migration Mapping

```text
MongoDB Expense Document                    Relational Ledger Entry
────────────────────────                    ───────────────────────
_id: ObjectId(...)                   ───>   id: UUID
userId: ObjectId(...)                ───>   user_id: UUID
amount: 4250.50 (Float)              ───>   amount_minor: 425050 (BigInt/Integer)
description: "Whole Foods"           ───>   description: "Whole Foods"
category: "food"                     ───>   category_id: (maps to categories table)
date: ISODate(...)                   ───>   date: ISO-8601 string
                                     ───>   account_id: (auto-associated checking account)
                                     ───>   transaction_entries: [Debit Food, Credit Checking]
```

---

## 2. Automated Schema Initialization
The database schema automatically self-provisions on server startup via `initializeDatabase()` in `backend/src/db/index.ts`:
1. Executes `CREATE TABLE IF NOT EXISTS` for all 14 core relational tables.
2. Creates performance indices on `(user_id, date)`, `(account_id)`, and `(category_id)`.
3. Seeds default system categories (Food, Housing, Transportation, Utilities, Salary, Investments).
4. Seeds institutional demo accounts upon initial demo authentication.

---

## 3. Production PostgreSQL Migration Deployment (Drizzle Kit)

To generate and deploy Drizzle SQL migration files to a production PostgreSQL 16/18 cluster:

1. Configure connection in `backend/.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/fintrack
   ```

2. Generate migration snapshots:
   ```bash
   npx drizzle-kit generate
   ```

3. Apply migration to database:
   ```bash
   npx drizzle-kit migrate
   ```
