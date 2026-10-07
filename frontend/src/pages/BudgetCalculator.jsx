import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  PieChart,
  HelpCircle,
  Coins,
  CheckCircle2
} from 'lucide-react';
import './BudgetCalculator.css';

const BudgetCalculator = () => {
  // Input states
  const [monthlyIncome, setMonthlyIncome] = useState(120000);
  const [needsExpenses, setNeedsExpenses] = useState(55000); // Housing, food, bills
  const [wantsExpenses, setWantsExpenses] = useState(25000); // Dining, recreation
  const [currentSavings, setCurrentSavings] = useState(450000); // Liquid emergency cash
  const [debtPayments, setDebtPayments] = useState(10000); // EMIs or loans

  // Calculations
  const totalExpenses = needsExpenses + wantsExpenses + debtPayments;
  const netMonthlySurplus = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netMonthlySurplus / monthlyIncome) * 100) : 0;
  
  // 50/30/20 Recommended vs Actual
  const recommendedNeeds = Math.round(monthlyIncome * 0.50);
  const recommendedWants = Math.round(monthlyIncome * 0.30);
  const recommendedSavings = Math.round(monthlyIncome * 0.20);

  const actualNeedsPct = monthlyIncome > 0 ? Math.round((needsExpenses / monthlyIncome) * 100) : 0;
  const actualWantsPct = monthlyIncome > 0 ? Math.round((wantsExpenses / monthlyIncome) * 100) : 0;
  const actualSurplusPct = monthlyIncome > 0 ? Math.round((netMonthlySurplus / monthlyIncome) * 100) : 0;

  // Emergency Runway
  const runwayMonths = totalExpenses > 0 ? (currentSavings / totalExpenses).toFixed(1) : '∞';
  const runwayNum = Number(runwayMonths);

  const getRunwayStatus = (m) => {
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
            Model your 50/30/20 allocation, monthly cash surplus, and liquid emergency fund runway in real time.
            Zero sign-up required.
          </p>
        </div>
      </header>

      {/* ══ MAIN INTERACTIVE CALCULATOR ══ */}
      <section className="calc-main-section">
        <div className="calc-container">
          <div className="calc-grid">
            {/* Inputs Column */}
            <div className="calc-card inputs-card">
              <div className="card-header">
                <Calculator size={18} className="header-icon" />
                <h3>Monthly Ledger Inputs</h3>
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Total Monthly Net Income</label>
                  <span className="input-readout">₹{monthlyIncome.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Essential Needs (Housing, Utilities, Food)</label>
                  <span className="input-readout">₹{needsExpenses.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="300000"
                  step="2500"
                  value={needsExpenses}
                  onChange={e => setNeedsExpenses(Number(e.target.value))}
                />
              </div>

              <div className="input-group">
                <div className="input-label-row">
                  <label>Discretionary Wants (Dining, Travel, Subs)</label>
                  <span className="input-readout">₹{wantsExpenses.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
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
                    <span>Needs (Target 50%)</span>
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
                    <span>Wants (Target 30%)</span>
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
                    <span>Surplus / Savings (Target 20%)</span>
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

              {/* Action Banner */}
              <div className="results-cta-strip">
                <p>Want to track this live with real bank sync and zero float errors?</p>
                <Link to="/register" className="btn-calc-launch">
                  Save to Free BudgetRoot Workspace <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ EDUCATIONAL GUIDE (SEO RANKING CONTENT) ══ */}
      <section className="calc-guide-section">
        <div className="calc-container">
          <div className="guide-content">
            <h2>How to Use This Budget Calculator for Maximum Wealth Growth</h2>
            
            <div className="guide-grid">
              <div className="guide-item">
                <h3>1. What is an Emergency Runway?</h3>
                <p>
                  Emergency runway measures how many months you could survive on your liquid reserves if all income stopped today. Financial advisors recommend a baseline of 3 to 6 months for salaried professionals, and 6 to 12 months for freelancers or business owners.
                </p>
              </div>

              <div className="guide-item">
                <h3>2. How the 50/30/20 Rule Works</h3>
                <p>
                  Created by Senator Elizabeth Warren, the 50/30/20 guideline divides your take-home pay into 50% for unavoidable essentials (needs), 30% for quality of life (wants), and 20% for future security (debt payoff and liquid savings).
                </p>
              </div>

              <div className="guide-item">
                <h3>3. Upgrading to Zero-Based Budgeting</h3>
                <p>
                  While 50/30/20 provides a quick rule of thumb, high-net-worth savers graduate to <strong>Zero-Based Budgeting</strong>: allocating every single rupee or dollar explicitly before the month begins, leaving $0 unallocated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BudgetCalculator;
