import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  DollarSign,
  Lock,
  Calculator,
  ChevronRight
} from 'lucide-react';
import './CompareYnab.css';

const COMPARISON_DATA = [
  {
    feature: 'Annual Cost',
    budgetroot: 'Free ($0 / yr)',
    ynab: '$109 / yr ($14.99/mo)',
    excel: 'Free (or Office 365)',
    highlight: true
  },
  {
    feature: 'Core Methodology',
    budgetroot: 'Strict Zero-Based Budgeting',
    ynab: 'Zero-Based Budgeting',
    excel: 'Manual Formulas',
    highlight: false
  },
  {
    feature: 'Ledger Precision',
    budgetroot: 'Integer Minor Units (Zero Float Error)',
    ynab: 'Floating-Point Approximations',
    excel: 'Floating-Point IEEE 754',
    highlight: true
  },
  {
    feature: 'Data Privacy & Ads',
    budgetroot: '100% Private (Zero Data Selling)',
    ynab: 'Third-Party Analytics',
    excel: 'Local File',
    highlight: true
  },
  {
    feature: 'Subscription Leak Radar',
    budgetroot: 'Automated Recurrence Audit',
    ynab: 'Manual Category Tagging',
    excel: 'Manual Entry',
    highlight: false
  },
  {
    feature: 'Scenario Lab & Runway Simulation',
    budgetroot: 'Built-in Stress-Testing Engine',
    ynab: 'Not Available',
    excel: 'Complex Custom VBA',
    highlight: true
  },
  {
    feature: 'Conversational Ledger Assistant',
    budgetroot: 'Ask BudgetRoot (Ledger Facts)',
    ynab: 'Not Available',
    excel: 'Not Available',
    highlight: true
  },
  {
    feature: 'Data Sovereignty & CSV Export',
    budgetroot: 'Instant 1-Click CSV Export',
    ynab: 'CSV Export Available',
    excel: 'Native Spreadsheet',
    highlight: false
  },
  {
    feature: 'Setup Time',
    budgetroot: '< 60 Seconds',
    ynab: 'Hours of Setup & Video Tutorials',
    excel: 'Days of Building Templates',
    highlight: false
  }
];

const CompareYnab = () => {
  return (
    <div className="compare-page">
      {/* ══ HEADER ══ */}
      <header className="compare-header">
        <div className="compare-container">
          <div className="compare-eyebrow">
            <span>[COMPARISON_ANALYSIS // 2026_EDITION]</span>
          </div>

          <h1 className="compare-title">
            The Free YNAB Alternative Built for Financial Precision
          </h1>

          <p className="compare-subtitle">
            Looking for a serious zero-based budgeting platform without paying $109 every year?
            Compare BudgetRoot with YNAB, Monarch Money, and Excel spreadsheets.
          </p>

          <div className="compare-header-actions">
            <Link to="/register" className="btn-compare-primary">
              Launch Free BudgetRoot Workspace <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-compare-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ══ MAIN MATRIX TABLE ══ */}
      <section className="compare-table-section">
        <div className="compare-container">
          <div className="table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="th-feature">Core Dimension</th>
                  <th className="th-budgetroot">
                    <div className="th-brand-badge">
                      <Logo size={20} />
                      <span>BudgetRoot</span>
                    </div>
                    <span className="th-tag">Recommended Free</span>
                  </th>
                  <th className="th-competitor">
                    <span>You Need A Budget (YNAB)</span>
                    <span className="th-sub">$109 / year</span>
                  </th>
                  <th className="th-competitor">
                    <span>Excel / Google Sheets</span>
                    <span className="th-sub">Manual Maintenance</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? 'row-highlight' : ''}>
                    <td className="td-feature">
                      <strong>{row.feature}</strong>
                    </td>
                    <td className="td-budgetroot">
                      <span className="value-badge-root">
                        <Check size={14} className="check-icon" />
                        {row.budgetroot}
                      </span>
                    </td>
                    <td className="td-competitor">
                      <span>{row.ynab}</span>
                    </td>
                    <td className="td-competitor">
                      <span>{row.excel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ DEEP DIVE EDITORIAL REASONS ══ */}
      <section className="compare-editorial-section">
        <div className="compare-container">
          <div className="section-header">
            <span className="section-eyebrow">THE ARCHITECTURAL DIFFERENCE</span>
            <h2>Why Financial Planners Switch to BudgetRoot</h2>
            <p>
              Traditional budgeting apps either charge steep recurring subscriptions or reduce budgeting to passive category tagging. BudgetRoot approaches money with institutional clarity.
            </p>
          </div>

          <div className="editorial-cards-grid">
            <div className="editorial-card">
              <div className="editorial-index">01 // PRICING</div>
              <h3>Zero Subscription Gatekeeping</h3>
              <p>
                Budgeting software that charges you $109/year ($14.99/mo) to track your money is an oxymoron. BudgetRoot believes foundational personal financial clarity should be accessible to everyone at zero cost.
              </p>
            </div>

            <div className="editorial-card">
              <div className="editorial-index">02 // MATHEMATICS</div>
              <h3>Integer Minor-Unit Ledger Accuracy</h3>
              <p>
                Standard consumer apps use JavaScript floating-point numbers, causing fractional penny drift (`0.1 + 0.2 = 0.30000000000000004`). BudgetRoot records every asset and expense in whole minor units (cents/paise), guaranteeing mathematically auditable double-entry accounting.
              </p>
            </div>

            <div className="editorial-card">
              <div className="editorial-index">03 // FORECASTING</div>
              <h3>Active Scenario Modeling</h3>
              <p>
                YNAB tells you what you spent yesterday. BudgetRoot's Scenario Lab lets you model what happens if you lose your job, face 8% inflation, take a 3-month sabbatical, or buy real estate.
              </p>
            </div>

            <div className="editorial-card">
              <div className="editorial-index">04 // INTELLIGENCE</div>
              <h3>Fact-Based Assistant ("Ask BudgetRoot")</h3>
              <p>
                Instead of searching through dense reports, type plain queries like "What is my emergency runway?" or "How much did I spend on dining this month?". BudgetRoot inspects your actual ledger facts to provide instant, precise answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONVERSION BANNER ══ */}
      <section className="compare-cta-section">
        <div className="compare-container">
          <div className="compare-cta-box">
            <h2>Ready to Experience True Zero-Based Budgeting?</h2>
            <p>
              Import your transactions or start fresh in 60 seconds. No credit card required.
            </p>
            <div className="compare-cta-actions">
              <Link to="/register" className="btn-compare-primary">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link to="/calculator" className="btn-compare-secondary">
                Try Budget Calculator First <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompareYnab;
