import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Sliders,
  TrendingUp,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Sparkles,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import './ScenarioLabModal.css';

const ScenarioLabModal = ({ isOpen, onClose }) => {
  const [outflowReductionPercent, setOutflowReductionPercent] = useState(10);
  const [incomeChangePercent, setIncomeChangePercent] = useState(0);
  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState(10000);

  // TanStack Query for simulated outcomes
  const { data: simulation, isLoading, refetch } = useQuery({
    queryKey: ['scenario-simulation', outflowReductionPercent, incomeChangePercent, monthlySavingsTarget],
    queryFn: async () => {
      const res = await api.post('/api/scenarios/simulate', {
        outflowReductionPercent: Number(outflowReductionPercent),
        incomeChangePercent: Number(incomeChangePercent),
        monthlySavingsTarget: Number(monthlySavingsTarget)
      });
      return res.data;
    },
    enabled: isOpen
  });

  const handleReset = () => {
    setOutflowReductionPercent(0);
    setIncomeChangePercent(0);
    setMonthlySavingsTarget(0);
  };

  if (!isOpen) return null;

  const baseline = simulation?.baseline || {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySurplus: 0,
    liquidReserves: 0,
    runwayMonths: 0
  };

  const projected = simulation?.projected || {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySurplus: 0,
    runwayMonths: 0,
    runwayDeltaMonths: 0,
    extraMonthlySavings: 0
  };

  const goalsTrajectory = simulation?.goalsTrajectory || [];

  return (
    <div className="scenario-lab-backdrop" onClick={onClose}>
      <div className="scenario-lab-dialog animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="scenario-lab-header">
          <div className="header-title-wrap">
            <div className="header-icon-box">
              <Sliders size={20} />
            </div>
            <div>
              <h2>What-If Financial Planner</h2>
              <p className="subtitle">
                See how saving a little more or cutting back helps you grow your cushion and reach goals faster
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleReset} title="Reset to baseline">
              <RotateCcw size={13} /> Reset
            </button>
            <button className="btn-close" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="scenario-lab-body">
          {/* Controls Column */}
          <div className="scenario-controls-panel">
            <h3 className="section-label">Try Different Scenarios</h3>

            {/* Slider 1: Outflow Reduction */}
            <div className="control-card">
              <div className="control-label-row">
                <span className="control-name">Cut non-essential spending by</span>
                <span className="control-value-badge positive tabular-num">
                  -{outflowReductionPercent}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={outflowReductionPercent}
                onChange={e => setOutflowReductionPercent(Number(e.target.value))}
                className="range-slider"
              />
              <div className="control-range-bounds">
                <span>0% (As-is)</span>
                <span>25%</span>
                <span>50% (Strict)</span>
              </div>
            </div>

            {/* Slider 2: Income Change */}
            <div className="control-card">
              <div className="control-label-row">
                <span className="control-name">If monthly income changes by</span>
                <span className={`control-value-badge tabular-num ${incomeChangePercent >= 0 ? 'positive' : 'negative'}`}>
                  {incomeChangePercent >= 0 ? `+${incomeChangePercent}%` : `${incomeChangePercent}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="50"
                step="5"
                value={incomeChangePercent}
                onChange={e => setIncomeChangePercent(Number(e.target.value))}
                className="range-slider"
              />
              <div className="control-range-bounds">
                <span>-20% (Lower)</span>
                <span>0% (Same)</span>
                <span>+50% (Raise)</span>
              </div>
            </div>

            {/* Slider 3: Additional Monthly Savings */}
            <div className="control-card">
              <div className="control-label-row">
                <span className="control-name">Put extra into savings each month</span>
                <span className="control-value-badge accent tabular-num">
                  +₹{Number(monthlySavingsTarget).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="2500"
                value={monthlySavingsTarget}
                onChange={e => setMonthlySavingsTarget(Number(e.target.value))}
                className="range-slider"
              />
              <div className="control-range-bounds">
                <span>₹0</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="scenario-results-panel">
            <h3 className="section-label">Your Projected Results</h3>

            {/* Delta Impact Hero Banner */}
            <div className="impact-hero-banner">
              <div className="impact-stat-item">
                <span className="stat-label">Emergency Cushion</span>
                <div className="stat-val-row">
                  <span className="stat-number tabular-num">{projected.runwayMonths}</span>
                  <span className="stat-unit">months</span>
                  {projected.runwayDeltaMonths !== 0 && (
                    <span className={`delta-tag tabular-num ${projected.runwayDeltaMonths > 0 ? 'positive' : 'negative'}`}>
                      {projected.runwayDeltaMonths > 0 ? `+${projected.runwayDeltaMonths}` : projected.runwayDeltaMonths} mo
                    </span>
                  )}
                </div>
                <span className="stat-subtext">Currently: {baseline.runwayMonths} months</span>
              </div>

              <div className="impact-stat-item">
                <span className="stat-label">Money Saved Each Month</span>
                <div className="stat-val-row">
                  <span className="stat-number tabular-num">
                    ₹{Math.round(projected.monthlySurplus).toLocaleString('en-IN')}
                  </span>
                  {projected.monthlySurplus !== baseline.monthlySurplus && (
                    <span className={`delta-tag tabular-num ${projected.monthlySurplus > baseline.monthlySurplus ? 'positive' : 'negative'}`}>
                      {projected.monthlySurplus > baseline.monthlySurplus ? '+' : ''}
                      ₹{Math.round(projected.monthlySurplus - baseline.monthlySurplus).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="stat-subtext">Currently: ₹{Math.round(baseline.monthlySurplus).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Active Goals Acceleration Trajectory */}
            <div className="goals-trajectory-section">
              <div className="section-subhead">
                <Target size={15} />
                <span>How Your Savings Goals Accelerate</span>
              </div>

              {goalsTrajectory.length === 0 ? (
                <div className="goals-trajectory-empty">
                  No savings goals set yet. Visit <strong>Savings Goals</strong> in the navigation bar to add a goal and watch how fast you can achieve it!
                </div>
              ) : (
                <div className="goals-trajectory-list">
                  {goalsTrajectory.map(g => (
                    <div key={g.id} className="goal-trajectory-card">
                      <div className="goal-card-main">
                        <div className="goal-header-row">
                          <span className="goal-title">{g.title}</span>
                          <span className="goal-amounts tabular-num">
                            ₹{Math.round(g.currentAmount).toLocaleString('en-IN')} / ₹{Math.round(g.targetAmount).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="dates-comparison-row">
                          <div className="date-block baseline">
                            <span className="date-label">Current target:</span>
                            <span className="date-value">{g.baselineTargetDate ? g.baselineTargetDate.substring(0, 10) : 'Ongoing'}</span>
                          </div>
                          <ArrowRight size={14} className="date-arrow" />
                          <div className="date-block projected">
                            <span className="date-label">New target:</span>
                            <span className="date-value">{g.projectedTargetDate ? g.projectedTargetDate.substring(0, 10) : 'Accelerated'}</span>
                          </div>
                        </div>
                      </div>

                      {g.monthsSaved > 0 && (
                        <div className="goal-acceleration-pill">
                          <CheckCircle2 size={13} />
                          <span>{g.monthsSaved} month{g.monthsSaved > 1 ? 's' : ''} sooner!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="scenario-lab-footer">
          <span className="audit-note">
            Simulated using your real income, spending patterns, and current bank balances.
          </span>
          <button className="btn btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioLabModal;
