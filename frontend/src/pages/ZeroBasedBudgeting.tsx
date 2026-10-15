import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Compass,
  ChevronRight
} from 'lucide-react';
import './ZeroBasedBudgeting.css';

interface StepItem {
  step: string;
  title: string;
  desc: string;
}

const STEPS: StepItem[] = [
  {
    step: '01',
    title: 'Aggregate Total Net Inflow',
    desc: 'Calculate your actual take-home income across salary, freelance invoices, dividends, and interest for the upcoming month. Every cent of incoming cash must be quantified.'
  },
  {
    step: '02',
    title: 'Audit Essential Fixed Commitments',
    desc: 'List non-negotiable living costs: housing, loan EMIs, utilities, groceries, and insurance. These form your core survival threshold.'
  },
  {
    step: '03',
    title: 'Assign Sinking Funds & Irregular Reserves',
    desc: 'Account for annual expenses—car repairs, medical deductibles, tax payments, seasonal gifts—by dividing annual costs by 12 and holding them in allocated envelopes.'
  },
  {
    step: '04',
    title: 'Direct Surplus to Accelerated Wealth',
    desc: 'Direct remaining inflows toward high-yield savings, index funds, debt principal prepayments, or emergency runway fortification.'
  },
  {
    step: '05',
    title: 'Target: Income - Allocations = Exactly $0',
    desc: 'If you have $500 unallocated, your budget is not complete. Give that $500 a specific job before the month starts so it cannot slip into mindless spending.'
  }
];

const ZeroBasedBudgeting: React.FC = () => {
  return (
    <div className="zbb-page">
      {/* ══ HERO ══ */}
      <header className="zbb-header">
        <div className="zbb-container">
          <div className="zbb-eyebrow">
            <span>[METHODOLOGY_GUIDE // FOUNDATIONAL_FINANCE]</span>
          </div>
          <h1 className="zbb-title">
            The Complete Zero-Based Budgeting Framework
          </h1>
          <p className="zbb-subtitle">
            Give every dollar a purpose before the month begins. Discover the disciplined mathematical system used by wealth builders to eliminate unbudgeted spending and achieve financial sovereignty.
          </p>
          <div className="zbb-actions">
            <Link to="/register" className="btn-zbb-primary">
              Build Your Zero-Based Budget Free <ArrowRight size={16} />
            </Link>
            <Link to="/calculator" className="btn-zbb-secondary">
              Calculate Cash Runway First
            </Link>
          </div>
        </div>
      </header>

      {/* ══ THE CORE PREMISE ══ */}
      <section className="zbb-formula-section">
        <div className="zbb-container">
          <div className="formula-box">
            <div className="formula-label">THE MATHEMATICAL RULE</div>
            <div className="formula-equation">
              <span>MONTHLY INCOME</span>
              <span className="operator">−</span>
              <span>ALL ALLOCATIONS</span>
              <span className="operator">=</span>
              <span className="result">EXACTLY $0.00</span>
            </div>
            <p className="formula-explanation">
              "Zero-based" does not mean having zero money in your bank account. It means every dollar of earned income is deliberately deployed to expenses, savings, investments, or debt paydown—leaving $0 unassigned.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 5-STEP IMPLEMENTATION PROCESS ══ */}
      <section className="zbb-steps-section">
        <div className="zbb-container">
          <div className="section-header">
            <span className="section-eyebrow">STEP-BY-STEP EXECUTION</span>
            <h2>How to Execute Zero-Based Budgeting in 5 Steps</h2>
            <p>
              Moving from passive expense tracking to proactive capital management takes less than 30 minutes a month.
            </p>
          </div>

          <div className="steps-list">
            {STEPS.map((s, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number">{s.step}</div>
                <div className="step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY SPREADSHEETS FAIL AT ZERO-BASED BUDGETING ══ */}
      <section className="zbb-comparison-section">
        <div className="zbb-container">
          <div className="comparison-box">
            <h2>Why Spreadsheets Break Under Zero-Based Budgeting</h2>
            <div className="reasons-grid">
              <div className="reason-item">
                <div className="reason-icon"><Zap size={20} /></div>
                <h4>Manual Entry Fatigue</h4>
                <p>Logging every transaction into Excel or Google Sheets by hand lasts 2 weeks before burnout sets in. BudgetRoot automates categorization instantly.</p>
              </div>

              <div className="reason-item">
                <div className="reason-icon"><ShieldCheck size={20} /></div>
                <h4>Broken Formulas & Float Drift</h4>
                <p>One misplaced comma in a SUM formula corrupts an entire year of data. BudgetRoot uses an integer-minor double-entry ledger with zero float error.</p>
              </div>

              <div className="reason-item">
                <div className="reason-icon"><TrendingUp size={20} /></div>
                <h4>No Active Scenario Modeling</h4>
                <p>Spreadsheets show static snapshots. BudgetRoot lets you simulate what-if scenarios (job change, recession, sabbatical) in one click.</p>
              </div>

              <div className="reason-item">
                <div className="reason-icon"><Compass size={20} /></div>
                <h4>Impulse Leaks & Emotional Spending</h4>
                <p>
                  Spreadsheets can't stop emotional retail therapy. Wealth discipline requires mental clarity alongside zero-based tracking. Many users pair BudgetRoot with private emotional journaling platforms like{' '}
                  <a
                    href="https://getrealign.in"
                    target="_blank"
                    rel="noopener"
                    style={{ color: 'var(--accent, #10B981)', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    ReAlign (getrealign.in)
                  </a>{' '}
                  to reframe anxiety before deploying capital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONVERSION CTA ══ */}
      <section className="zbb-cta-section">
        <div className="zbb-container">
          <div className="zbb-cta-card">
            <h2>Put Zero-Based Budgeting on Autopilot</h2>
            <p>
              Start commanding your money with BudgetRoot's free institutional ledger. Setup takes under 60 seconds.
            </p>
            <div className="zbb-cta-buttons">
              <Link to="/register" className="btn-zbb-primary">
                Launch BudgetRoot Workspace <ArrowRight size={16} />
              </Link>
              <Link to="/compare/ynab-alternative" className="btn-zbb-secondary">
                Compare vs YNAB ($109/yr) <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZeroBasedBudgeting;
