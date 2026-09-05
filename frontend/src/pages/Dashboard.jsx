import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { QUERY_KEYS } from '../lib/queryClient';
import EChart from '../components/charts/EChart';
import TransferModal from '../components/modals/TransferModal';
import ImportStatementModal from '../components/modals/ImportStatementModal';
import HealthScoreModal from '../components/modals/HealthScoreModal';
import AddExpenseModal from '../components/AddExpenseModal';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  Upload,
  Search,
  Wallet,
  Building2,
  CreditCard,
  ChevronRight,
  Sparkles,
  Info,
  Compass,
  CalendarClock,
  Sliders,
  PieChart
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({
  onOpenSubscriptions,
  onOpenScenarioLab,
  onOpenWhatChanged,
  onOpenNetWorth
}) => {
  const navigate = useNavigate();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  // Single aggregated high-performance query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.dashboardSummary,
    queryFn: async () => {
      const res = await api.get('/api/dashboard/summary');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="dashboard-loading-container">
        <div className="dashboard-skeleton-banner"></div>
        <div className="dashboard-skeleton-grid">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
        <div className="dashboard-skeleton-chart"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-error-state">
        <AlertTriangle size={36} className="error-icon" />
        <h2>Unable to load your financial overview</h2>
        <p>{error?.response?.data?.error?.message || error?.message || 'Server connection failed.'}</p>
        <button className="btn btn-primary" onClick={() => refetch()}>
          Retry Connecting
        </button>
      </div>
    );
  }

  const { position, health, anomalies = [], categoryBreakdown = [], monthlyTimeline = [], recentTransactions = [], accounts = [], goals = [] } = data;

  // Determine if charts have non-zero data
  const hasTimelineData = monthlyTimeline.length > 0 && monthlyTimeline.some(m => (m.income || 0) > 0 || (m.expenses || 0) > 0);
  const hasCategoryData = categoryBreakdown.length > 0 && categoryBreakdown.some(c => (c.value || 0) > 0);

  // Friendly Empty States for Charts
  const timelineEmptyContent = (
    <div className="chart-friendly-empty">
      <div className="friendly-empty-icon"><TrendingUp size={24} /></div>
      <h4>No income or spending recorded yet</h4>
      <p>Add your first expense or upload a bank statement to see your monthly income and spending trends!</p>
      <div className="empty-actions-row">
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddExpense(true)}>
          <Plus size={14} /> + Add Expense
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowImportModal(true)}>
          <Upload size={14} /> Upload Statement
        </button>
      </div>
    </div>
  );

  const categoryEmptyContent = (
    <div className="chart-friendly-empty">
      <div className="friendly-empty-icon"><PieChart size={24} /></div>
      <h4>No category spending yet</h4>
      <p>When you record expenses (like groceries, dining, or shopping), your category breakdown will show here.</p>
      <button className="btn btn-secondary btn-sm" onClick={() => setShowAddExpense(true)}>
        <Plus size={14} /> Add an Expense
      </button>
    </div>
  );

  // ECharts Configuration for Cashflow Dynamics Timeline
  const timelineMonths = monthlyTimeline.map(m => {
    const [y, mon] = m.month.split('-');
    const date = new Date(Number(y), Number(mon) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const timelineOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: 'rgba(255,255,255,0.2)', type: 'dashed' } },
      formatter: (params) => {
        let html = `<div style="font-weight:700; margin-bottom:4px;">${params[0].axisValue}</div>`;
        params.forEach(p => {
          html += `<div style="display:flex; justify-content:space-between; gap:16px;">
            <span>${p.marker} ${p.seriesName}:</span>
            <span style="font-weight:600;">₹${Number(p.value).toLocaleString('en-IN')}</span>
          </div>`;
        });
        return html;
      }
    },
    legend: {
      data: ['Money In (Income)', 'Money Out (Expenses)'],
      right: 10,
      textStyle: { color: '#9CA3AF', fontSize: 11 }
    },
    xAxis: {
      type: 'category',
      data: timelineMonths.length > 0 ? timelineMonths : ['Current Month']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
      }
    },
    series: [
      {
        name: 'Money In (Income)',
        type: 'bar',
        data: monthlyTimeline.map(m => m.income),
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 28
      },
      {
        name: 'Money Out (Expenses)',
        type: 'bar',
        data: monthlyTimeline.map(m => m.expenses),
        itemStyle: { color: '#F43F5E', borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 28
      }
    ]
  };

  // ECharts Configuration for Category Breakdown
  const categoryOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ₹{c} ({d}%)'
    },
    series: [
      {
        name: 'Spending Categories',
        type: 'pie',
        radius: ['52%', '76%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'var(--bg-surface)',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' }
        },
        data: categoryBreakdown.map(c => ({ name: c.name, value: c.value }))
      }
    ]
  };

  // Tabular fallback for accessibility
  const tableFallback = (
    <table className="accessible-chart-table">
      <thead>
        <tr>
          <th>Period</th>
          <th>Money In (Income)</th>
          <th>Money Out (Expenses)</th>
          <th>Net Saved</th>
        </tr>
      </thead>
      <tbody>
        {monthlyTimeline.map((m, i) => (
          <tr key={i}>
            <td>{m.month}</td>
            <td className="tabular-num">₹{m.income.toLocaleString('en-IN')}</td>
            <td className="tabular-num">₹{m.expenses.toLocaleString('en-IN')}</td>
            <td className="tabular-num">₹{(m.income - m.expenses).toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="command-center-container">
      {/* 1. Header & Quick Actions */}
      <div className="command-center-header">
        <div className="header-title-group">
          <h1>Financial Overview</h1>
          <p className="subtitle">A clear, simple look at your money, spending, and savings</p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenWhatChanged}
            title="See how your spending and income shifted from last month"
          >
            <Compass size={15} /> This Month vs Last
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenSubscriptions}
            title="Track regular bills and monthly subscriptions"
          >
            <CalendarClock size={15} /> Subscriptions
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenScenarioLab}
            title="See what happens if you save more or cut back"
          >
            <Sliders size={15} /> What-If Planner
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowTransferModal(true)}
            title="Move money between your accounts"
          >
            <ArrowRightLeft size={15} /> Transfer Money
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowImportModal(true)}
            title="Upload bank statement CSV"
          >
            <Upload size={15} /> Upload Statement
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddExpense(true)}
            title="Record a new expense or purchase"
          >
            <Plus size={16} /> + Add Expense
          </button>
        </div>
      </div>

      {/* 2. Primary Position Metrics Grid */}
      <div className="position-metrics-grid">
        <div className="metric-panel flagship interactive" onClick={onOpenNetWorth} title="Click to see how your net worth changed">
          <div className="metric-panel-header">
            <span className="metric-label">Total Net Worth</span>
            <span className="metric-inspect-hint">Breakdown ↗</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-currency">₹</span>
            <span className="metric-number tabular-num">
              {Math.round(position.netWorth).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="metric-panel-footer">
            <span>Cash in Bank: ₹{Math.round(position.liquidCash).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="metric-panel">
          <div className="metric-panel-header">
            <span className="metric-label">Safe to Spend</span>
            <Info size={14} className="metric-info-icon" title="Money you can spend freely after covering upcoming bills and savings" />
          </div>
          <div className="metric-value-row">
            <span className="metric-currency">₹</span>
            <span className="metric-number tabular-num">
              {Math.round(position.safeToSpend).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="metric-panel-footer positive">
            <span>Free to spend guilt-free</span>
          </div>
        </div>

        <div className="metric-panel interactive" onClick={onOpenScenarioLab} title="Click to simulate growing your cushion">
          <div className="metric-panel-header">
            <span className="metric-label">Emergency Cushion</span>
            <span className="metric-inspect-hint">Plan ahead ↗</span>
          </div>
          <div className="metric-value-row">
            <span className="metric-number tabular-num">
              {position.monthlyExpenses > 0 ? position.cashRunwayMonths : (position.liquidCash > 0 ? '—' : '0')}
            </span>
            <span className="metric-unit">months</span>
          </div>
          <div className="metric-panel-footer">
            <span>
              {position.monthlyExpenses > 0
                ? 'Living expenses covered without new income'
                : 'Add expenses to calculate your safety net'}
            </span>
          </div>
        </div>

        <div className="metric-panel interactive" onClick={() => setShowHealthModal(true)} title="Click to see what makes up your financial health score">
          <div className="metric-panel-header">
            <span className="metric-label">Financial Health</span>
            <span className="metric-inspect-hint">See details ↗</span>
          </div>
          <div className="metric-value-row">
            <ShieldCheck size={26} className="health-icon" />
            <span className="metric-number tabular-num">
              {health.healthScore > 0 ? health.healthScore : '—'}
            </span>
            <span className="metric-denom">/ 100</span>
          </div>
          <div className="metric-panel-footer">
            <span className="health-status-text">
              {health.healthScore > 0
                ? `${health.healthScore >= 80 ? 'Excellent' : health.healthScore >= 60 ? 'Good Shape' : health.healthScore >= 40 ? 'Fair Shape' : 'Getting Started'} • Tap for breakdown`
                : 'Awaiting activity • Add transactions to score'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Anomalies & Outlier Alerts (Truthful, non-fabricated) */}
      {anomalies.length > 0 && (
        <div className="anomaly-alert-bar animate-slide-up">
          <div className="anomaly-icon-wrap">
            <AlertTriangle size={18} />
          </div>
          <div className="anomaly-content">
            <strong>Unusual spending noticed:</strong> {anomalies[0].description} (₹{anomalies[0].amount.toLocaleString('en-IN')}) — {anomalies[0].reason}
          </div>
          <button className="btn-link" onClick={() => navigate('/expenses')}>
            Review in Expenses →
          </button>
        </div>
      )}

      {/* 4. Cashflow Dynamics Timeline (ECharts) & Category Composition */}
      <div className="visualizer-row">
        <div className="visualizer-card timeline-card">
          <div className="visualizer-card-header">
            <div>
              <h3>Income vs Spending</h3>
              <p className="subtitle">Compare what you earned vs what you spent each month</p>
            </div>
            <div className="visualizer-legend-stats">
              <span className="legend-stat inflow">
                Money In: ₹{Math.round(position.monthlyIncome).toLocaleString('en-IN')}
              </span>
              <span className="legend-stat outflow">
                Money Out: ₹{Math.round(position.monthlyExpenses).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <EChart
            option={timelineOption}
            height={320}
            hasData={hasTimelineData}
            emptyContent={timelineEmptyContent}
            tableFallback={tableFallback}
          />
        </div>

        <div className="visualizer-card category-card">
          <div className="visualizer-card-header">
            <div>
              <h3>Where Your Money Goes</h3>
              <p className="subtitle">Breakdown of your spending by category</p>
            </div>
          </div>
          <EChart
            option={categoryOption}
            height={220}
            hasData={hasCategoryData}
            emptyContent={categoryEmptyContent}
          />
          {hasCategoryData && (
            <div className="category-mini-legend">
              {categoryBreakdown.slice(0, 4).map((c, i) => (
                <div key={i} className="mini-legend-item">
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-val tabular-num">₹{c.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Accounts Overview & Recent Activity */}
      <div className="ledger-overview-row">
        {/* Linked Accounts */}
        <div className="overview-panel accounts-panel">
          <div className="panel-header">
            <h3>Bank Accounts & Cards</h3>
            <button className="btn-link" onClick={() => setShowTransferModal(true)}>
              Transfer Money
            </button>
          </div>
          <div className="accounts-list">
            {accounts.map(acc => (
              <div key={acc.id} className="account-row-item">
                <div className="account-icon-box" style={{ borderColor: acc.color }}>
                  {acc.type === 'credit_card' ? <CreditCard size={18} /> : acc.type === 'checking' ? <Building2 size={18} /> : <Wallet size={18} />}
                </div>
                <div className="account-details">
                  <span className="acc-name">{acc.name}</span>
                  <span className="acc-inst">{acc.institution || 'Account'} • {acc.type === 'credit_card' ? 'Credit Card' : acc.type === 'checking' ? 'Checking' : acc.type === 'savings' ? 'Savings' : acc.type}</span>
                </div>
                <div className="account-balance-cell tabular-num">
                  ₹{Math.round(acc.currentBalance).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overview-panel transactions-panel">
          <div className="panel-header">
            <h3>Recent Activity</h3>
            <button className="btn-link" onClick={() => navigate('/expenses')}>
              View All Expenses ({recentTransactions.length}) <ChevronRight size={14} />
            </button>
          </div>

          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="ledger-empty-row">
                      No recent transactions found. Tap <strong>+ Add Expense</strong> above to add your first purchase or bill!
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id || tx._id}>
                      <td className="tx-date-cell">{tx.date.substring(0, 10)}</td>
                      <td className="tx-desc-cell">{tx.description || tx.title}</td>
                      <td className="tx-cat-cell">
                        <span className="category-pill">{tx.category}</span>
                      </td>
                      <td className={`tx-amount-cell tabular-num ${tx.type === 'income' ? 'inflow' : 'outflow'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{Math.round(tx.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onAddExpense={() => {
            setShowAddExpense(false);
            refetch();
          }}
        />
      )}

      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {showImportModal && (
        <ImportStatementModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {showHealthModal && (
        <HealthScoreModal
          isOpen={showHealthModal}
          onClose={() => setShowHealthModal(false)}
          healthData={health}
        />
      )}
    </div>
  );
};

export default Dashboard;