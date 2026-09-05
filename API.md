# FinTrack REST API Reference

All requests must supply `Authorization: Bearer <token>` unless marked Public. Responses strictly adhere to JSON canonical representations.

## 1. System & Observability
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Returns server uptime, memory footprint, engine version. |
| `GET` | `/ready` | Public | Returns database readiness check. |

---

## 2. Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new user and provisions default institutional accounts. |
| `POST` | `/api/auth/login` | Public | Authenticates via email and password; returns JWT token and user profile. |
| `POST` | `/api/auth/google` | Public | Verifies Google OAuth signature server-side; provisions or fetches account. |
| `GET` | `/api/auth/me` | Bearer | Returns the authenticated user session. |

---

## 3. Financial Command Center & Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Bearer | Aggregated endpoint returning net worth, safe-to-spend, cash runway, health score, timeline, and anomalies in a single high-performance payload. |
| `GET` | `/api/expenses/monthly` | Bearer | Historical monthly inflows and outflows for trend charts. |
| `GET` | `/api/expenses/summary` | Bearer | Aggregated category breakdown. |
| `GET` | `/api/analytics/net-worth-waterfall` | Bearer | Opening balance + Inflows - Outflows = Closing net worth waterfall bridge. |

---

## 4. Accounts & Ledger
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/accounts` | Bearer | Lists all active institutional accounts with current and available balances. |
| `POST` | `/api/accounts` | Bearer | Creates a new account (checking, savings, credit_card, cash, investment, loan). |
| `PUT` | `/api/accounts/:id` | Bearer | Updates account metadata or performs balance reconciliation adjustments. |
| `DELETE` | `/api/accounts/:id` | Bearer | Soft-archives an account. |
| `GET` | `/api/transactions` | Bearer | Paginated ledger transactions with filters (`limit`, `offset`, `search`, `type`). |
| `POST` | `/api/transactions` | Bearer | Creates transaction in integer minor units, updates account balance, and posts ledger entries. |
| `POST` | `/api/transactions/transfer` | Bearer | Executes double-entry account-to-account transfer with zero net-worth alteration. |
| `PUT` | `/api/transactions/:id` | Bearer | Updates transaction description, date, or amount with balance adjustment. |
| `DELETE` | `/api/transactions/:id` | Bearer | Deletes transaction and reverses account balance impact. |

---

## 5. Goals & Planning
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/goals` | Bearer | Lists goals with completion %, remaining amount, and required monthly contributions. |
| `POST` | `/api/goals` | Bearer | Creates a financial target goal. |
| `POST` | `/api/goals/:id/deposit` | Bearer | Deposits funds into a goal with optional ledger debit transaction. |
| `PUT` | `/api/goals/:id` | Bearer | Updates goal target amount or target date. |
| `DELETE` | `/api/goals/:id` | Bearer | Deletes a goal. |

---

## 6. Statement Import & Reconciliation
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/imports/preview` | Bearer | Ingests CSV statement data, auto-maps columns, and checks against cryptographic fingerprints (`SHA256(account+date+amount+desc)`) to report valid vs duplicate rows. |
| `POST` | `/api/imports/commit` | Bearer | Batch-commits approved statement transactions into account ledger. |

---

## 7. AI & Intelligence Layer
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/insights` | Bearer | Computes deterministic 7-pillar health score and evidence-backed strategic recommendations. |
| `POST` | `/api/ai/ask` | Bearer | Natural language financial queries citing exact factual ledger figures. |
