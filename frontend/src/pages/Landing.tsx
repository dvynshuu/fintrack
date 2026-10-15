import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Calculator,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import './Landing.css';

interface LedgerRow {
  date: string;
  counterparty: string;
  category: string;
  type: string;
  amount: string;
  status: string;
}

const LEDGER_ROWS: LedgerRow[] = [
  { date: '04 Oct', counterparty: 'Vanguard Nifty 50 Index Fund', category: 'Investment Envelope', type: 'outflow', amount: '-₹35,000.00', status: 'VERIFIED' },
  { date: '03 Oct', counterparty: 'HDFC Tech Corp Payroll', category: 'Primary Operating Inflow', type: 'inflow', amount: '+₹1,45,000.00', status: 'RECONCILED' },
  { date: '02 Oct', counterparty: 'AWS Cloud Services Cloudflare', category: 'Infrastructure / Tools', type: 'outflow', amount: '-₹4,280.00', status: 'AUDITED' },
  { date: '01 Oct', counterparty: 'Netflix Premium 4K UHD', category: 'Recurring Subscription', type: 'outflow', amount: '-₹649.00', status: 'FLAGGED_SUB' },
  { date: '30 Sep', counterparty: 'Apartment Lease & Maintenance', category: 'Essential Living', type: 'outflow', amount: '-₹28,500.00', status: 'VERIFIED' },
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'How does BudgetRoot prevent floating-point calculation errors?',
    a: 'Consumer budgeting apps that store currency as standard JavaScript floats suffer from rounding drift (e.g. 0.1 + 0.2 = 0.30000000000000004). BudgetRoot records all ledger transactions and balances strictly as integer minor units (paise/cents). Calculations maintain absolute mathematical precision down to the single penny.'
  },
  {
    q: 'Why is BudgetRoot completely free while YNAB charges $109/year?',
    a: 'We believe fundamental personal financial clarity should not be gated behind an annual subscription fee. BudgetRoot operates on a lean, high-efficiency architecture designed for individuals who want institutional double-entry control without recurring SaaS bloat.'
  },
  {
    q: 'How does the Zero-Based Budgeting model work in BudgetRoot?',
    a: 'Every single dollar or rupee of earned income is deliberately assigned to expenses, savings envelopes, or investments before the month begins. The mathematical requirement is: Income − Allocations = Exactly $0.00. Unassigned money cannot drift into unnoticed spending.'
  },
  {
    q: 'Can I export my data or move away at any time?',
    a: 'Yes. BudgetRoot adheres to full data sovereignty. You can export your entire transaction ledger, category mappings, and account history to CSV in one click at any moment.'
  },
  {
    q: 'How does BudgetRoot handle privacy and security?',
    a: 'We never sell, rent, or aggregate your financial history for advertising networks, loan brokers, or hedge funds. Authentication is backed by cryptographically signed SHA-256 tokens and constant-time salt-hashed credentials.'
  }
];

const Landing: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Interactive Live Runway Calculator State
  const [calcIncome, setCalcIncome] = useState<number>(125000);
  const [calcExpenses, setCalcExpenses] = useState<number>(58000);
  const [calcSavings, setCalcSavings] = useState<number>(480000);

  const monthlySurplus = Math.max(0, calcIncome - calcExpenses);
  const savingsRate = calcIncome > 0 ? Math.round((monthlySurplus / calcIncome) * 100) : 0;
  const runwayMonths = calcExpenses > 0 ? (calcSavings / calcExpenses).toFixed(1) : '∞';

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  return (
    <div className="budgetroot-landing">
      {/* ══ HARDWARE HEADER & TERMINAL HERO ══ */}
      <section className="landing-hero-section">
        <div className="landing-container">
          <h1 className="hero-title">
            Personal finance, grounded in clarity.
          </h1>

          <p className="hero-subtitle">
            Plan with zero-based budgets, track everyday spending, and see your true net worth in one calm place. Simple, private, and free forever.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn-hardware-primary">
              Get Started Free <ArrowRight size={15} />
            </Link>

            <Link to="/compare/ynab-alternative" className="btn-hardware-secondary">
              See How It Compares <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ REALISTIC FINANCIAL WORKSTATION TERMINAL (NOT A FAKE BLOB) ══ */}
      <section className="terminal-workstation-section">
        <div className="landing-container">
          <div className="workstation-frame">
            {/* Console Bar */}
            <div className="workstation-console-bar">
              <div className="console-meta-left">
                <span className="node-indicator">NODE: IN-MUM-01</span>
                <span className="console-path">budgetroot/ledger/reconciled.ledger</span>
              </div>
              <div className="console-meta-right">
                <span className="console-badge">0.00 FLOAT DRIFT</span>
                <span className="console-badge green">LEDGER VERIFIED</span>
              </div>
            </div>

            {/* Readout Metrics */}
            <div className="workstation-readout-row">
              <div className="readout-cell">
                <span className="readout-label">NET WORTH BALANCE</span>
                <span className="readout-val">₹5,25,000.00</span>
                <span className="readout-sub positive">+14.2% YoY Allocation</span>
              </div>
              <div className="readout-cell">
                <span className="readout-label">MONTHLY OPERATING INFLOW</span>
                <span className="readout-val">₹1,45,000.00</span>
                <span className="readout-sub">Reconciled Payroll</span>
              </div>
              <div className="readout-cell">
                <span className="readout-label">TOTAL ALLOCATED OUTFLOWS</span>
                <span className="readout-val">₹68,429.00</span>
                <span className="readout-sub">47.2% Expenditure</span>
              </div>
              <div className="readout-cell">
                <span className="readout-label">LIQUID EMERGENCY RUNWAY</span>
                <span className="readout-val highlight">8.3 Months</span>
                <span className="readout-sub">Fortified Liquidity</span>
              </div>
            </div>

            {/* Live Ledger Table */}
            <div className="workstation-table-wrap">
              <table className="workstation-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Counterparty / Entity</th>
                    <th>Ledger Category Envelope</th>
                    <th>Audit Status</th>
                    <th className="align-right">Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {LEDGER_ROWS.map((row, idx) => (
                    <tr key={idx}>
                      <td className="col-mono">{row.date}</td>
                      <td className="col-strong">{row.counterparty}</td>
                      <td><span className="category-pill">{row.category}</span></td>
                      <td>
                        <span className={`status-tag ${row.status.toLowerCase()}`}>
                          [{row.status}]
                        </span>
                      </td>
                      <td className={`align-right col-mono ${row.type}`}>
                        {row.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HIGH-INTENT EXPLORATION HUB (TARGETING GOOGLE PAGES) ══ */}
      <section className="landing-hub-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">[SEARCH_INTENT // CAPABILITY_MODULES]</span>
            <h2 className="section-heading">Explore High-Clarity Financial Architecture</h2>
            <p className="section-description">
              Dive into our interactive calculators, software comparisons, and foundational zero-based methodologies.
            </p>
          </div>

          <div className="hub-grid">
            {/* Card 1: Calculator */}
            <Link to="/calculator" className="hub-card">
              <div className="hub-card-top">
                <span className="hub-index">01 // INTERACTIVE TOOL</span>
                <ArrowRight size={16} className="hub-arrow" />
              </div>
              <h3>Free Budget & Runway Calculator</h3>
              <p>
                Model your 50/30/20 budget envelope, calculate monthly savings ratios, and simulate emergency runway without signing up.
              </p>
              <div className="hub-tag">High-Utility Tool →</div>
            </Link>

            {/* Card 2: Compare YNAB */}
            <Link to="/compare/ynab-alternative" className="hub-card highlight">
              <div className="hub-card-top">
                <span className="hub-index">02 // 2026 COMPARISON</span>
                <ArrowRight size={16} className="hub-arrow" />
              </div>
              <h3>BudgetRoot vs YNAB & Excel</h3>
              <p>
                See why users are leaving $109/yr subscription models for BudgetRoot's zero-cost, integer-minor double-entry ledger.
              </p>
              <div className="hub-tag">Free YNAB Alternative →</div>
            </Link>

            {/* Card 3: Zero-Based Budgeting */}
            <Link to="/methodology/zero-based-budgeting" className="hub-card">
              <div className="hub-card-top">
                <span className="hub-index">03 // CORE METHODOLOGY</span>
                <ArrowRight size={16} className="hub-arrow" />
              </div>
              <h3>Zero-Based Budgeting Framework</h3>
              <p>
                Learn how to assign every single dollar or rupee a defined job so Income − Allocations = $0.00.
              </p>
              <div className="hub-tag">The 5-Step System →</div>
            </Link>

            {/* Card 4: Security & Privacy */}
            <Link to="/security" className="hub-card">
              <div className="hub-card-top">
                <span className="hub-index">04 // DATA SOVEREIGNTY</span>
                <ArrowRight size={16} className="hub-arrow" />
              </div>
              <h3>Institutional Security & E-E-A-T</h3>
              <p>
                Understand our zero-commercial-data policy: bank-grade tokens, client encryption, and instant 1-click CSV portability.
              </p>
              <div className="hub-tag">Privacy Standards →</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ THE 4 CORE ENGINEERING PILLARS (NO GENERIC BUZZWORDS) ══ */}
      <section className="landing-pillars-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">[CORE_ENGINEERING // DIFFERENTIATION]</span>
            <h2 className="section-heading">Why Consumer Budgeting Software Fails</h2>
            <p className="section-description">
              Most personal finance apps are either ad-supported data harvesting engines or glorified spreadsheets. BudgetRoot is engineered differently.
            </p>
          </div>

          <div className="pillars-table-box">
            <div className="pillar-row">
              <div className="pillar-num">01</div>
              <div className="pillar-title">Integer-Minor Unit Accounting</div>
              <div className="pillar-body">
                Standard JavaScript floating-point numbers (`0.1 + 0.2 = 0.30000000000000004`) lead to balance drift over years. BudgetRoot records all values in whole integer minor units (cents/paise), guaranteeing mathematically verifiable double-entry integrity.
              </div>
            </div>

            <div className="pillar-row">
              <div className="pillar-num">02</div>
              <div className="pillar-title">Strict Zero-Based Envelope Enforcement</div>
              <div className="pillar-body">
                We reject passive expense logging. BudgetRoot forces you to proactively allocate capital into operating, sinking, and investment envelopes before the first bill arrives, ensuring zero unmonitored leakage.
              </div>
            </div>

            <div className="pillar-row">
              <div className="pillar-num">03</div>
              <div className="pillar-title">Deterministic Scenario Simulation Lab</div>
              <div className="pillar-body">
                Model real-world contingencies in real time: career transitions, inflation shocks, or emergency medical expenditures. Measure how every scenario shifts your runway in months with zero guesswork.
              </div>
            </div>

            <div className="pillar-row">
              <div className="pillar-num">04</div>
              <div className="pillar-title">Subscription Radar & Leak Audit</div>
              <div className="pillar-body">
                Automatically detects recurring charges across Netflix, Spotify, gym memberships, and cloud SaaS. Forecasts upcoming renewal dates so forgotten trials never drain your available liquidity.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ THE BEHAVIORAL HALF OF WEALTH: PSYCHOLOGY & MINDFUL ALIGNMENT ══ */}
      <section className="landing-behavioral-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">[BEHAVIORAL_FINANCE // MINDFUL_ALIGNMENT]</span>
            <h2 className="section-heading">Wealth is 20% Arithmetic. The Other 80% is Psychology.</h2>
            <p className="section-description">
              Rigorous zero-based budgeting balances your accounts, but emotional regulation protects your savings from stress spending, retail therapy, and cognitive burnout.
            </p>
          </div>

          <div className="behavioral-grid">
            {/* Context Card 1: The Psychology of Money */}
            <div className="behavioral-card philosophy-card">
              <div className="behavioral-card-header">
                <span className="b-tag">COGNITIVE PATTERNS</span>
                <h3>The Spending & Stress Feedback Loop</h3>
              </div>
              <p className="b-lead">
                Over 70% of unplanned budget leaks are emotional compensations for chronic stress, cognitive fatigue, and financial anxiety. When willpower is depleted, disciplined envelopes break.
              </p>
              <ul className="b-points">
                <li>
                  <CheckCircle2 size={16} className="icon-green" />
                  <span><strong>Stress-Induced Outflows:</strong> Unpack the urge to spend before making spontaneous purchases.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="icon-green" />
                  <span><strong>Anxiety De-escalation:</strong> Eliminate the dread of checking accounts through calm, intentional reflection.</span>
                </li>
                <li>
                  <CheckCircle2 size={16} className="icon-green" />
                  <span><strong>Long-Term Alignment:</strong> Align daily mental habits with your true multi-year financial runway goals.</span>
                </li>
              </ul>
            </div>

            {/* Context Card 2: Allied Partner - ReAlign */}
            <div className="behavioral-card partner-card">
              <div className="behavioral-card-header">
                <div className="partner-badge-row">
                  <span className="b-tag highlight">ALLIED ECOSYSTEM</span>
                  <span className="partner-status-pill">PRIVACY ALLIANCE</span>
                </div>
                <h3>Mindful Life & Habit Alignment with ReAlign</h3>
              </div>
              <p className="b-lead">
                To cultivate the mental clarity needed for disciplined money management, we recommend our allied partner{' '}
                <a
                  href="https://getrealign.in"
                  target="_blank"
                  rel="noopener"
                  className="inline-dofollow-link"
                >
                  ReAlign (getrealign.in)
                </a>
                .
              </p>
              <p className="b-description">
                Built with zero-knowledge AES-256-GCM encryption and an unyielding zero-training AI policy, ReAlign acts as a private emotional sounding board. Track mood rhythms, reframe racing thoughts with Atlas, and restore cognitive grounding before making significant financial commitments.
              </p>
              <div className="partner-pill-row">
                <span className="pill-item">AES-256 Zero-Knowledge</span>
                <span className="pill-item">Zero AI Model Training</span>
                <span className="pill-item">Atlas Thought Sounding Board</span>
                <span className="pill-item">Granular Mood Rhythm Mapping</span>
              </div>
              <div className="partner-action">
                <a
                  href="https://getrealign.in"
                  target="_blank"
                  rel="noopener"
                  className="btn-hardware-secondary btn-partner-link"
                >
                  Visit ReAlign (getrealign.in) <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ INTERACTIVE RUNWAY SANDBOX ══ */}
      <section className="landing-sandbox-section">
        <div className="landing-container">
          <div className="sandbox-layout">
            <div className="sandbox-info">
              <span className="section-eyebrow">[INTERACTIVE_SANDBOX // LIVE_SIMULATOR]</span>
              <h2>Test Your Fiscal Runway & Surplus Rate</h2>
              <p>
                Adjust the parameters below to compute your actual financial resilience buffer in real time.
              </p>
              <div className="sandbox-features-list">
                <div><CheckCircle2 size={16} className="icon-green" /> Immediate live arithmetic feedback</div>
                <div><CheckCircle2 size={16} className="icon-green" /> Calculates exact emergency runway in months</div>
                <div><CheckCircle2 size={16} className="icon-green" /> Zero sign-up required to experiment</div>
              </div>
              <div className="sandbox-cta-wrap">
                <Link to="/calculator" className="btn-hardware-secondary">
                  Open Full 50/30/20 Calculator <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="sandbox-widget">
              <div className="widget-header">
                <Calculator size={16} className="icon-green" />
                <span>LIQUIDITY_BUFFER_CALCULATOR</span>
              </div>

              <div className="widget-controls">
                <div className="control-item">
                  <div className="control-header">
                    <span>Monthly Operating Inflows</span>
                    <span className="control-num">₹{calcIncome.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="500000"
                    step="5000"
                    value={calcIncome}
                    onChange={e => setCalcIncome(Number(e.target.value))}
                  />
                </div>

                <div className="control-item">
                  <div className="control-header">
                    <span>Monthly Necessary Outflows</span>
                    <span className="control-num">₹{calcExpenses.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="300000"
                    step="2500"
                    value={calcExpenses}
                    onChange={e => setCalcExpenses(Number(e.target.value))}
                  />
                </div>

                <div className="control-item">
                  <div className="control-header">
                    <span>Liquid Emergency Reserves</span>
                    <span className="control-num">₹{calcSavings.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2500000"
                    step="25000"
                    value={calcSavings}
                    onChange={e => setCalcSavings(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="widget-results">
                <div className="w-result-cell">
                  <span className="w-label">MONTHLY SURPLUS</span>
                  <span className="w-val positive">₹{monthlySurplus.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-result-cell">
                  <span className="w-label">SAVINGS RATIO</span>
                  <span className="w-val">{savingsRate}%</span>
                </div>
                <div className="w-result-cell">
                  <span className="w-label">CASH RUNWAY</span>
                  <span className="w-val highlight">{runwayMonths} mos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ SECTION (MATCHING JSON-LD FAQ SCHEMA) ══ */}
      <section className="landing-faq-section" id="faq">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-eyebrow">[TECHNICAL_FAQ // E-E-A-T]</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-description">
              Authoritative answers about BudgetRoot's mathematics, data sovereignty, and architecture.
            </p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`faq-item-clean ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} size={16} />
                  </button>
                  {isOpen && (
                    <div className="faq-drawer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CONVERSION FOOTER BANNER ══ */}
      <section className="landing-action-banner">
        <div className="landing-container">
          <div className="action-box">
            <div className="action-tag">[INITIALIZE_WORKSPACE]</div>
            <h2>Command Your Finances with Institutional Precision</h2>
            <p>
              Join disciplined investors, engineers, and wealth builders tracking net worth with zero float error.
            </p>
            <div className="action-buttons">
              <Link to="/register" className="btn-hardware-primary">
                Get Started Free <ArrowRight size={15} />
              </Link>
              <Link to="/calculator" className="btn-hardware-secondary">
                Try Budget Calculator <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
