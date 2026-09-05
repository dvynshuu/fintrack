import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  Compass,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  AlertCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import './WhatChangedModal.css';

const WhatChangedModal = ({ isOpen, onClose }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['what-changed-analysis'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/what-changed');
      return res.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  const current = data?.currentMonth || { period: '', income: 0, expenses: 0, netSavings: 0, savingsRate: 0 };
  const previous = data?.previousMonth || { period: '', income: 0, expenses: 0, netSavings: 0, savingsRate: 0 };
  const deltas = data?.deltas || { inflowDelta: 0, inflowDeltaPercent: 0, outflowDelta: 0, outflowDeltaPercent: 0, netSavingsDelta: 0 };
  const categoryShifts = data?.categoryShifts || [];
  const takeaway = data?.takeaway || 'Analysis synchronized.';

  const formatPeriod = (str) => {
    if (!str) return 'Current';
    const [y, m] = str.split('-');
    const d = new Date(Number(y), Number(m) - 1);
    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="what-changed-backdrop" onClick={onClose}>
      <div className="what-changed-dialog animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="what-changed-header">
          <div className="header-title-wrap">
            <div className="header-icon-box">
              <Compass size={20} />
            </div>
            <div>
              <h2>This Month vs Last Month</h2>
              <p className="subtitle">
                See how your spending and income compare between {formatPeriod(previous.period)} and {formatPeriod(current.period)}
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Executive Takeaway Bar */}
        <div className="diagnosis-takeaway-bar">
          <span className="takeaway-badge">Summary</span>
          <p className="takeaway-text">{takeaway}</p>
        </div>

        {/* Modal Body */}
        <div className="what-changed-body">
          {isLoading ? (
            <div className="wc-loading-state">
              <RefreshCw className="spin-icon" size={24} />
              <span>Comparing this month with last month...</span>
            </div>
          ) : error ? (
            <div className="wc-error-state">
              <AlertCircle size={24} />
              <span>Unable to calculate monthly comparison.</span>
              <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Variance Comparison Metrics Grid */}
              <div className="variance-grid">
                <div className="variance-card">
                  <span className="v-label">Total Spent (Expenses)</span>
                  <div className="v-main-row">
                    <span className="v-current tabular-num">
                      ₹{Math.round(current.expenses).toLocaleString('en-IN')}
                    </span>
                    <span className={`v-pill tabular-num ${deltas.outflowDelta <= 0 ? 'positive' : 'negative'}`}>
                      {deltas.outflowDelta > 0 ? (
                        <>
                          <ArrowUpRight size={13} /> +{deltas.outflowDeltaPercent}%
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={13} /> {deltas.outflowDeltaPercent}%
                        </>
                      )}
                    </span>
                  </div>
                  <span className="v-baseline">
                    Last month: ₹{Math.round(previous.expenses).toLocaleString('en-IN')} ({deltas.outflowDelta > 0 ? `+₹${Math.round(deltas.outflowDelta).toLocaleString('en-IN')} more` : `₹${Math.abs(Math.round(deltas.outflowDelta)).toLocaleString('en-IN')} saved`})
                  </span>
                </div>

                <div className="variance-card">
                  <span className="v-label">Total Earned (Income)</span>
                  <div className="v-main-row">
                    <span className="v-current tabular-num">
                      ₹{Math.round(current.income).toLocaleString('en-IN')}
                    </span>
                    <span className={`v-pill tabular-num ${deltas.inflowDelta >= 0 ? 'positive' : 'negative'}`}>
                      {deltas.inflowDelta >= 0 ? (
                        <>
                          <ArrowUpRight size={13} /> +{deltas.inflowDeltaPercent}%
                        </>
                      ) : (
                        <>
                          <ArrowDownRight size={13} /> {deltas.inflowDeltaPercent}%
                        </>
                      )}
                    </span>
                  </div>
                  <span className="v-baseline">
                    Last month: ₹{Math.round(previous.income).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="variance-card">
                  <span className="v-label">Money Saved (Left Over)</span>
                  <div className="v-main-row">
                    <span className={`v-current tabular-num ${current.netSavings >= 0 ? 'text-positive' : 'text-negative'}`}>
                      ₹{Math.round(current.netSavings).toLocaleString('en-IN')}
                    </span>
                    <span className={`v-pill tabular-num ${deltas.netSavingsDelta >= 0 ? 'positive' : 'negative'}`}>
                      {deltas.netSavingsDelta >= 0 ? '+' : ''}₹{Math.round(deltas.netSavingsDelta).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="v-baseline">
                    Savings rate: {previous.savingsRate}% → {current.savingsRate}%
                  </span>
                </div>
              </div>

              {/* Category Shifts Breakdown */}
              <div className="category-shifts-section">
                <div className="shifts-header">
                  <h3>Where Your Spending Changed</h3>
                  <span className="shifts-hint">Ranked by change in spending</span>
                </div>

                {categoryShifts.length === 0 ? (
                  <div className="shifts-empty">
                    <FileSpreadsheet size={28} />
                    <p>Add transactions across multiple months to see your category shifts here!</p>
                  </div>
                ) : (
                  <div className="shifts-table-wrap">
                    <table className="shifts-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th style={{ textAlign: 'right' }}>Last Month</th>
                          <th style={{ textAlign: 'right' }}>This Month</th>
                          <th style={{ textAlign: 'right' }}>Difference</th>
                          <th style={{ textAlign: 'right' }}>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryShifts.map((cat, i) => (
                          <tr key={i}>
                            <td className="category-name-cell">
                              <strong>{cat.category}</strong>
                            </td>
                            <td className="tabular-num" style={{ textAlign: 'right' }}>
                              ₹{Math.round(cat.previous).toLocaleString('en-IN')}
                            </td>
                            <td className="tabular-num" style={{ textAlign: 'right', fontWeight: 600 }}>
                              ₹{Math.round(cat.current).toLocaleString('en-IN')}
                            </td>
                            <td className={`tabular-num ${cat.delta > 0 ? 'text-negative' : cat.delta < 0 ? 'text-positive' : ''}`} style={{ textAlign: 'right', fontWeight: 600 }}>
                              {cat.delta > 0 ? `+₹${Math.round(cat.delta).toLocaleString('en-IN')}` : cat.delta < 0 ? `-₹${Math.abs(Math.round(cat.delta)).toLocaleString('en-IN')}` : '₹0'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className={`shift-pill tabular-num ${cat.percentChange > 0 ? 'higher' : cat.percentChange < 0 ? 'lower' : 'flat'}`}>
                                {cat.percentChange > 0 ? `+${cat.percentChange}%` : `${cat.percentChange}%`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="what-changed-footer">
          <span className="wc-audit-note">
            Comparing full calendar months based on your recorded transactions.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatChangedModal;
