import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import EChart from '../../components/charts/EChart';
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  X,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import './NetWorthModal.css';

const NetWorthModal = ({ isOpen, onClose }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['net-worth-waterfall'],
    queryFn: async () => {
      const res = await api.get('/api/analytics/net-worth-waterfall');
      return res.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  const opening = data?.openingNetWorth || 0;
  const inflows = data?.totalInflows || 0;
  const outflows = data?.totalOutflows || 0;
  const closing = data?.closingNetWorth || 0;
  const items = data?.items || [];

  // Construct ECharts Waterfall Stack Data
  // Waterfall uses 2 stacked series: 1st invisible base, 2nd delta bar
  const categories = items.map(item => item.name);
  const baseData = [];
  const barData = [];
  const colorList = [];

  let runningTotal = 0;
  items.forEach((item) => {
    if (item.type === 'base') {
      baseData.push(0);
      barData.push(item.amount);
      colorList.push('#6B7280');
      runningTotal = item.amount;
    } else if (item.type === 'inflow') {
      baseData.push(runningTotal);
      barData.push(item.amount);
      colorList.push('#10B981');
      runningTotal += item.amount;
    } else if (item.type === 'outflow') {
      runningTotal -= item.amount;
      baseData.push(Math.max(0, runningTotal));
      barData.push(item.amount);
      colorList.push('#F43F5E');
    } else if (item.type === 'total') {
      baseData.push(0);
      barData.push(item.amount);
      colorList.push('#38BDF8');
    }
  });

  const waterfallOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const itemParam = params.find(p => p.seriesName === 'Impact');
        if (!itemParam) return '';
        const idx = itemParam.dataIndex;
        const item = items[idx];
        return `<div style="font-weight:700; margin-bottom:4px;">${item.name}</div>
                <div style="color:${colorList[idx]}; font-weight:600;">
                  ₹${item.amount.toLocaleString('en-IN')}
                </div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        interval: 0,
        rotate: categories.length > 5 ? 25 : 0,
        color: '#9CA3AF',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
      }
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          }
        },
        data: baseData
      },
      {
        name: 'Impact',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'top',
          color: '#F3F4F6',
          fontSize: 10,
          formatter: (param) => {
            const val = param.value;
            return val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`;
          }
        },
        data: barData.map((val, idx) => ({
          value: val,
          itemStyle: {
            color: colorList[idx],
            borderRadius: [4, 4, 0, 0]
          }
        }))
      }
    ]
  };

  const tableFallback = (
    <table className="accessible-chart-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Type</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={idx}>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td className="tabular-num">₹{item.amount.toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="net-worth-backdrop" onClick={onClose}>
      <div className="net-worth-dialog animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="net-worth-header">
          <div className="header-title-wrap">
            <div className="header-icon-box">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2>Net Worth Breakdown</h2>
              <p className="subtitle">
                Starting balance + money earned − money spent = current net worth
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Executive Summary Cards */}
        <div className="waterfall-summary-row">
          <div className="wf-summary-card">
            <span className="wf-card-label">Starting Balance</span>
            <div className="wf-card-val tabular-num">
              ₹{Math.round(opening).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="wf-summary-card">
            <span className="wf-card-label">Total Money In</span>
            <div className="wf-card-val text-positive tabular-num">
              +₹{Math.round(inflows).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="wf-summary-card">
            <span className="wf-card-label">Total Money Out</span>
            <div className="wf-card-val text-negative tabular-num">
              -₹{Math.round(outflows).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="wf-summary-card flagship">
            <span className="wf-card-label">Current Net Worth</span>
            <div className="wf-card-val tabular-num">
              ₹{Math.round(closing).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Modal Body with EChart */}
        <div className="net-worth-body">
          {isLoading ? (
            <div className="nw-loading-state">
              <RefreshCw className="spin-icon" size={24} />
              <span>Calculating your net worth breakdown...</span>
            </div>
          ) : error ? (
            <div className="nw-error-state">
              <AlertCircle size={24} />
              <span>Unable to load net worth breakdown.</span>
              <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : (
            <div className="waterfall-chart-wrap">
              <EChart
                option={waterfallOption}
                height={380}
                hasData={items.length > 0}
                tableFallback={tableFallback}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="net-worth-footer">
          <span className="nw-audit-note">
            Reconciled directly from your linked bank accounts and recorded transactions.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetWorthModal;
