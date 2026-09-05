# FinTrack System Architecture

## 1. Architectural Philosophy
FinTrack is built as an **account-centric, ledger-first modular monolith**. It combines institutional financial precision with modern web ergonomics.

### High-Level Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Client (SPA)                     │
│  React 19 • TanStack Query v5 • Apache ECharts • Ctrl+K     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                FinTrack Backend Service                     │
│  Express • TypeScript Strict • Helmet • Rate-Limiter        │
│                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ Auth & Google │ │ Accounts Mod  │ │ Double-Entry      │  │
│  │ Security      │ │ & Balances    │ │ Ledger Mod        │  │
│  └───────────────┘ └───────────────┘ └───────────────────┘  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ Deterministic │ │ CSV Statement │ │ Evidence-Backed   │  │
│  │ Intel Engine  │ │ Recon Engine  │ │ AI Strategy       │  │
│  └───────────────┘ └───────────────┘ └───────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Drizzle ORM (SQL Transparent)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Relational Database Storage                 │
│  PostgreSQL / SQLite with WAL Mode & Foreign Key Integrity  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

### 2.1 Ledger-First Double Entry
FinTrack does NOT use disconnected expense or income buckets. Every financial mutation records:
1. A parent `Transaction` (describing the real-world financial event, merchant, date, amount).
2. Child `TransactionEntry` lines (debiting and crediting specific accounts).
3. Account-to-account transfers move capital between accounts with **zero net-worth disruption**.

### 2.2 Integer Minor-Units Money Engine
- Floating-point numbers are prohibited in database storage and mathematical aggregation.
- All amounts are stored as **integer minor units** (e.g. INR paise, USD cents: `₹1,250.50` -> `125050`).
- Exact penny allocation splits round-off residuals without fractional leakage.

### 2.3 Fail-Closed Zero-Trust Security
- No silent fallbacks to demo or mock users upon database timeouts.
- Server-side verification of Google OAuth signatures using `OAuth2Client.verifyIdToken()`.
- Helmet security headers, rate limiting on authentication routes, and strict CORS.
- All database queries enforce strict user ownership: `WHERE user_id = authenticated_user.id`.

### 2.4 Deterministic Intelligence Before LLM Interpretation
- Health scores, cash runway, safe-to-spend, and spending anomalies are computed mathematically by the deterministic calculation engine (`financial-engine.ts`).
- Large language models sit exclusively on top of verified mathematical facts to provide qualitative context and executive briefs. LLMs never fabricate fundamental metrics.
