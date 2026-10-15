import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  PieChart,
  HelpCircle,
  Coins,
  CheckCircle2
} from 'lucide-react';
import './BudgetCalculator.css';

const BudgetCalculator: React.FC = () => {
  // Input states
  const [monthlyIncome, setMonthlyIncome] = useState<number>(120000);
  const [needsExpenses, setNeedsExpenses] = useState<number>(55000); // Housing, food, bills
  const [wantsExpenses, setWantsExpenses] = useState<number>(25000); // Dining, recreation
  const [currentSavings, setCurrentSavings] = useState<number>(450000); // Liquid emergency cash
  const [debtPayments, setDebtPayments] = useState<number>(10000); // EMIs or loans

  // Calculations
  const totalExpenses = needsExpenses + wantsExpenses + debtPayments;
  const netMonthlySurplus = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netMonthlySurplus / monthlyIncome) * 100) : 0;

  // 50/30/20 Recommended vs Actual
  const recommendedNeeds = Math.round(monthlyIncome * 0.5);
  const recommendedWants = Math.round(monthlyIncome * 0.3);
  const recommendedSavings = Math.round(monthlyIncome * 0.2);

  const actualNeedsPct = monthlyIncome > 0 ? Math.round((needsExpenses / monthlyIncome) * 100) : 0;
  const actualWantsPct = monthlyIncome > 0 ? Math.round((wantsExpenses / monthlyIncome) * 100) : 0;
  const actualSurplusPct = monthlyIncome > 0 ? Math.round((netMonthlySurplus / monthlyIncome) * 100) : 0;

  // Emergency Runway
  const runwayMonths = totalExpenses > 0 ? (currentSavings / totalExpenses).toFixed(1) : '∞';
  const runwayNum = Number(runwayMonths);

  const getRunwayStatus = (m: number) => {
    if (m >= 6) return { label: 'Fortified Reserve', color: 'positive', desc: 'Over 6 months of living expenses secured. Top institutional resilience.' };
    if (m >= 3) return { label: 'Stable Buffer', color: 'neutral', desc: 'Meets minimum recommended safety standards. Keep building toward 6 months.' };
    return { label: 'Vulnerable Position', color: 'negative', desc: 'Less than 3 months of emergency buffer. Prioritize building liquid reserves.' };
  };

  const runwayStatus = getRunwayStatus(runwayNum);

  return (
    <div className="calc-page">
      {/* ══ HEADER ══ */}
      <header className="calc-header">
        <div className="calc-container">
          <div className="calc-eyebrow">
            <span>[FINANCIAL_UTILITY // RUNWAY_&_BUDGET_SIMULATOR]</span>
          </div>
          <h1 className="calc-title">
            Free Zero-Based Budget & Runway Calculator
          </h1>
          <p className="calc-subtitle">
            Model your monthly income, test living allocations against the proven 50/30/20 framework, and compute your true emergency reserve runway in real time.
          </p>
        </div>
      </header>

      {/* ══ INTERACTIVE WORKBENCH ══ */}
      <section className="calc-workbench-section">
        <div className="calc-container">
          <div className="calc-grid">
            {/* Inputs Column */}
            <div className="calc-card inputs-card">
              <div className="card-header">
                <Calculator size={18} className="header-icon" />
                <h3>Monthly Cash Flow Inputs</h3>
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Total Net Monthly Inflow</label>
                  <span className="input-readout">₹{monthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="1000000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Essential Needs (Rent, Utilities, Food)</label>
                  <span className="input-readout">₹{needsExpenses.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="2500"
                  value={needsExpenses}
                  onChange={e => setNeedsExpenses(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Discretionary Wants (Dining, Travel, Subscriptions)</label>
                  <span className="input-readout">₹{wantsExpenses.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300000"
                  step="2500"
                  value={wantsExpenses}
                  onChange={e => setWantsExpenses(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Debt Obligations & Loans</label>
                  <span className="input-readout">₹{debtPayments.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150000"
                  step="2500"
                  value={debtPayments}
                  onChange={e => setDebtPayments(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Current Liquid Savings Reserve</label>
                  <span className="input-readout">₹{currentSavings.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="3000000"
                  step="25000"
                  value={currentSavings}
                  onChange={e => setCurrentSavings(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Results Column */}
            <div className="calc-card results-card">
              <div className="card-header">
                <PieChart size={18} className="header-icon" />
                <h3>Financial Diagnostics</h3>
              </div>

              {/* Key Highlights */}
              <div className="results-metrics-row">
                <div className="result-metric">
                  <span className="metric-label">MONTHLY SURPLUS</span>
                  <div className={`metric-num ${netMonthlySurplus >= 0 ? 'positive' : 'negative'}`}>
                    ₹{netMonthlySurplus.toLocaleString('en-IN')}
                  </div>
                  <span className="metric-sub">{savingsRate}% Savings Ratio</span>
                </div>

                <div className="result-metric">
                  <span className="metric-label">EMERGENCY RUNWAY</span>
                  <div className="metric-num highlight">{runwayMonths} Months</div>
                  <span className={`status-pill ${runwayStatus.color}`}>{runwayStatus.label}</span>
                </div>
              </div>

              {/* 50/30/20 Rule Comparison */}
              <div className="breakdown-section">
                <h4>50/30/20 Framework Audit</h4>

                <div className="breakdown-bar-item">
                  <div className="bar-labels">
                    <span>Needs (Target 50% — ₹{recommendedNeeds.toLocaleString('en-IN')})</span>
                    <span>Actual: {actualNeedsPct}% (₹{needsExpenses.toLocaleString('en-IN')})</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${actualNeedsPct > 50 ? 'warning' : 'ok'}`}
                      style={{ width: `${Math.min(100, actualNeedsPct)}%` }}
                    />
                  </div>
                </div>

                <div className="breakdown-bar-item">
                  <div className="bar-labels">
                    <span>Wants (Target 30% — ₹{recommendedWants.toLocaleString('en-IN')})</span>
                    <span>Actual: {actualWantsPct}% (₹{wantsExpenses.toLocaleString('en-IN')})</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${actualWantsPct > 30 ? 'warning' : 'ok'}`}
                      style={{ width: `${Math.min(100, actualWantsPct)}%` }}
                    />
                  </div>
                </div>

                <div className="breakdown-bar-item">
                  <div className="bar-labels">
                    <span>Surplus / Savings (Target 20% — ₹{recommendedSavings.toLocaleString('en-IN')})</span>
                    <span>Actual: {actualSurplusPct}% (₹{netMonthlySurplus.toLocaleString('en-IN')})</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill ok"
                      style={{ width: `${Math.max(0, Math.min(100, actualSurplusPct))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Runway Verdict */}
              <div className="runway-verdict-box">
                <div className="verdict-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>{runwayStatus.label}:</strong> {runwayStatus.desc}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW TO USE GUIDE ══ */}
      <section className="calc-guide-section">
        <div className="calc-container">
          <div className="guide-box">
            <h2>How the 50/30/20 Rule Works</h2>
            <div className="guide-grid">
              <div className="guide-item">
                <span className="guide-step">50% NEEDS</span>
                <p>Non-negotiable survival expenses: rent/mortgage, utilities, essential groceries, insurance, and minimum debt payments.</p>
              </div>
              <div className="guide-item">
                <span className="guide-step">30% WANTS</span>
                <p>Flexible lifestyle upgrades: dining out, entertainment, vacations, gym memberships, and non-essential shopping.</p>
              </div>
              <div className="guide-item">
                <span className="guide-step">20% SAVINGS</span>
                <p>Building your wealth fortress: emergency funds, index funds, retirement accounts, and extra debt principal reduction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section className="calc-cta-section">
        <div className="calc-container">
          <div className="calc-cta-box">
            <h2>Ready to Put Your Budget into Real Practice?</h2>
            <p>BudgetRoot gives you institutional zero-based budgeting with double-entry arithmetic and zero subscription costs.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary">
                Open BudgetRoot Free <ArrowRight size={15} />
              </Link>
              <Link to="/compare/ynab-alternative" className="btn btn-outline">
                Compare vs YNAB
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BudgetCalculator;
