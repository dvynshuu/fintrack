# FinTrack Performance Engineering & Optimization

## 1. Network Waterfall Elimination
In the legacy architecture, the dashboard executed a waterfall of 4 separate unbatched HTTP requests on mount (`/api/expenses`, `/api/goals`, `/api/incomes`, `/api/expenses/monthly`, `/api/insights`), forcing the client to compute metrics in browser memory.

### Optimization: Single Consolidated Summary Endpoint
The `/api/dashboard/summary` endpoint returns:
- Net worth, liquid reserves, safe-to-spend, cash runway
- Deterministic 7-pillar health score & explanations
- Anomaly alerts
- Monthly inflow/outflow timeline
- Category composition
- Top accounts & recent ledger activity
in a single fast round-trip (~15-35ms response time).

---

## 2. Frontend Bundle Optimization & Code Splitting
- **Cleaned Dead Dependencies**: Removed bogus package `node.js: ^0.0.1-security`, and unused charting libraries `recharts: ^2.15.3` and `react-chartjs-2: ^5.3.0`.
- **Rollup Code Splitting**:
  - `react-vendor`: 38 kB (14 kB gzipped)
  - `query-vendor`: 76 kB (26 kB gzipped)
  - Application logic: 313 kB (92 kB gzipped)
  - `echarts-vendor`: Isolated chunk (352 kB gzipped) loaded independently.

---

## 3. Caching & Query Deduplication (TanStack Query v5)
- Stale time set to 2 minutes (`staleTime: 120000`).
- Garbage collection time set to 10 minutes (`gcTime: 600000`).
- Window focus refetching disabled to eliminate unnecessary server traffic.
- Targeted query invalidation: Mutations (e.g. transfer or new transaction) invalidate only affected keys (`dashboardSummary`, `accounts`, `transactions`), avoiding global full-collection re-fetches.

---

## 4. Database Access & Indexing
- High-frequency query patterns indexed:
  - `idx_transactions_user_date` on `(user_id, date)`
  - `idx_transactions_account` on `(account_id)`
  - `idx_transactions_category` on `(category_id)`
  - `idx_transaction_entries_tx` on `(transaction_id)`
  - `idx_accounts_user` on `(user_id)`
- Write-Ahead Logging (`WAL`) mode enabled with persistent connection pooling for sub-millisecond local reads.
