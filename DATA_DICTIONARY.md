# FinTrack Relational Data Dictionary

## 1. Core Tables

### `users`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `name` | TEXT | NO | Full name |
| `email` | TEXT | NO | Unique authenticated email |
| `password_hash` | TEXT | NO | Bcrypt password hash |
| `profile_picture` | TEXT | YES | Avatar URL |
| `phone` | TEXT | YES | Contact number |
| `location` | TEXT | YES | Residential city/state |
| `currency` | TEXT | NO | ISO 4217 currency code (default 'INR') |
| `language` | TEXT | NO | IETF language tag (default 'en') |
| `role` | TEXT | NO | Authorization role ('user', 'admin') |
| `created_at` | TEXT | NO | ISO timestamp |
| `updated_at` | TEXT | NO | ISO timestamp |

---

### `accounts`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `user_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `users(id)` |
| `name` | TEXT | NO | Account label (e.g. "HDFC Salary") |
| `type` | TEXT | NO | checking, savings, credit_card, cash, investment, loan, mortgage |
| `institution` | TEXT | YES | Financial institution name |
| `account_number_mask` | TEXT | YES | Last 4 digits (e.g. "•••• 4821") |
| `currency` | TEXT | NO | ISO currency code |
| `opening_balance_minor` | INTEGER | NO | Opening balance in integer minor units |
| `current_balance_minor` | INTEGER | NO | Current balance in integer minor units |
| `available_balance_minor`| INTEGER | NO | Available liquid balance in minor units |
| `color` | TEXT | YES | Hex color token |
| `icon` | TEXT | YES | Visual icon key |
| `is_archived` | INTEGER | NO | Boolean soft-archive flag |
| `created_at` | TEXT | NO | ISO timestamp |

---

### `transactions`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `user_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `users(id)` |
| `account_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `accounts(id)` |
| `type` | TEXT | NO | expense, income, transfer, refund, fee, adjustment |
| `status` | TEXT | NO | pending, posted, reconciled, voided |
| `amount_minor` | INTEGER | NO | Positive quantity in integer minor units |
| `currency` | TEXT | NO | ISO currency code |
| `date` | TEXT | NO | ISO date-time string |
| `description` | TEXT | NO | Normalized description / narration |
| `raw_description` | TEXT | YES | Original unparsed bank statement text |
| `merchant_id` | TEXT | YES | Foreign key $\rightarrow$ `merchants(id)` |
| `category_id` | TEXT | YES | Foreign key $\rightarrow$ `categories(id)` |
| `transfer_id` | TEXT | YES | Linked transfer group identifier |
| `fingerprint` | TEXT | YES | Cryptographic SHA-256 duplicate fingerprint |
| `notes` | TEXT | YES | User notes |
| `created_at` | TEXT | NO | ISO timestamp |

---

### `transaction_entries` (Double-Entry Ledger)
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `transaction_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `transactions(id)` |
| `account_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `accounts(id)` |
| `entry_type` | TEXT | NO | 'debit' or 'credit' |
| `amount_minor` | INTEGER | NO | Integer minor units |
| `currency` | TEXT | NO | ISO currency code |
| `created_at` | TEXT | NO | ISO timestamp |

---

### `transfers`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `user_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `users(id)` |
| `source_account_id` | TEXT (UUID) | NO | Origin account $\rightarrow$ `accounts(id)` |
| `destination_account_id`| TEXT (UUID) | NO | Target account $\rightarrow$ `accounts(id)` |
| `source_transaction_id` | TEXT (UUID) | NO | Outflow transaction $\rightarrow$ `transactions(id)` |
| `destination_transaction_id`| TEXT (UUID) | NO | Inflow transaction $\rightarrow$ `transactions(id)` |
| `amount_minor` | INTEGER | NO | Transfer quantity in integer minor units |
| `date` | TEXT | NO | ISO date-time string |

---

### `goals`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `user_id` | TEXT (UUID) | NO | Foreign key $\rightarrow$ `users(id)` |
| `title` | TEXT | NO | Milestone name |
| `type` | TEXT | NO | savings, emergency, purchase, travel, education |
| `target_amount_minor` | INTEGER | NO | Target in integer minor units |
| `current_amount_minor` | INTEGER | NO | Accumulated capital in minor units |
| `target_date` | TEXT | NO | Target completion date (YYYY-MM-DD) |
| `linked_account_id` | TEXT (UUID) | YES | Dedicated reserve account $\rightarrow$ `accounts(id)` |
| `status` | TEXT | NO | not_started, in_progress, completed, paused |
| `priority` | TEXT | NO | low, medium, high |
| `created_at` | TEXT | NO | ISO timestamp |

---

### `audit_events`
| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | NO | Primary key |
| `user_id` | TEXT (UUID) | YES | Foreign key $\rightarrow$ `users(id)` |
| `action` | TEXT | NO | create, update, delete, reconcile, import |
| `entity_type` | TEXT | NO | transaction, account, goal, user |
| `entity_id` | TEXT | NO | Affected entity identifier |
| `payload_summary` | TEXT | YES | Human-readable audit narrative |
| `created_at` | TEXT | NO | ISO timestamp |
