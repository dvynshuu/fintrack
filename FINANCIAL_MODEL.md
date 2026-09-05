# FinTrack Financial Model & Calculation Engine

## 1. Monetary Representation
FinTrack stores all currency quantities as signed 64-bit integer minor units alongside an ISO 4217 currency code:

$$\text{Stored Value} = \text{round}(\text{Major Currency Float} \times 10^{\text{decimals}})$$

Example:
- `₹1,250.50 INR` $\rightarrow$ `125050`
- `$45.00 USD` $\rightarrow$ `4500`

### Safe Rounding & Allocation
When splitting a transaction of amount $A$ across $k$ parts with weights $w_1, \dots, w_k$:
$$\text{share}_i = \left\lfloor \frac{A \cdot w_i}{\sum_j w_j} \right\rfloor$$
The residual cents/paise $R = A - \sum_{i} \text{share}_i$ are distributed sequentially to ensure $\sum \text{allocated} \equiv A$ with zero penny loss.

---

## 2. Balance & Net Worth Formulation

### Accounts
An account belongs to an institutional classification:
- **Asset Accounts**: Checking, Savings, Cash, Investments.
- **Liability Accounts**: Credit Cards, Lines of Credit, Mortgages, Term Loans.

$$\text{Total Assets} = \sum_{a \in \text{Assets}} \text{balance}(a)$$
$$\text{Total Liabilities} = \sum_{l \in \text{Liabilities}} |\text{balance}(l)|$$
$$\text{Net Worth} = \text{Total Assets} - \text{Total Liabilities}$$
$$\text{Liquid Available Reserves} = \sum_{a \in \{\text{Checking, Savings, Cash}\}} \text{balance}(a)$$

---

## 3. Core Deterministic Metrics

### 3.1 Cash Runway
Estimates how many months liquid reserves will sustain baseline living expenses:
$$\text{Runway (Months)} = \frac{\text{Liquid Available Reserves}}{\text{Normalized Monthly Essential Outflow}}$$

### 3.2 Safe to Spend
Discretionary cash available in the current cycle:
$$\text{Safe to Spend} = \max(0, \text{Liquid Available Reserves} - \text{Baseline 1-Month Reserve})$$

### 3.3 7-Pillar Financial Health Model (0 - 100)
The Health Score is computed deterministically across 7 weighted dimensions:

| Dimension | Weight | Target / Benchmark | Mathematical Function |
|---|---|---|---|
| **Savings Velocity** | 20% | 20%+ of monthly income | $\min\left(100, \frac{\text{Savings Rate \%}}{20} \times 100\right)$ |
| **Cash Resilience** | 20% | 6 months living expenses | $\min\left(100, \frac{\text{Cash Runway Months}}{6} \times 100\right)$ |
| **Debt Load** | 15% | 0% Debt-to-Income | $\max(0, 100 - (\text{DTI} \times 1.5))$ |
| **Cashflow Dynamics** | 15% | Net positive cash surplus | $70 + 30 \times (\text{Surplus Ratio})$ |
| **Liquidity Ratio** | 10% | 25%+ assets in cash equivalents | $\min\left(100, \frac{\text{Liquid Share}}{0.25} \times 100\right)$ |
| **Goal Trajectory** | 10% | Average goal funded progress | $\text{mean}(\text{Goal Progress \%})$ |
| **Account Diversity** | 10% | 3+ active operational accounts | $\min(100, \text{Account Count} \times 35)$ |

$$\text{Health Score} = \sum_{i=1}^{7} \text{Weight}_i \times \text{Score}_i$$
Every point is traceable to the user's underlying ledger records.
