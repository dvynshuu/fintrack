import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';
import {
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  CreditCard,
  Layers,
  ChevronRight
} from 'lucide-react';
import './SubscriptionsModal.css';

const SubscriptionsModal = ({ isOpen, onClose }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await api.get('/api/subscriptions');
      return res.data;
    },
    enabled: isOpen
  });

  if (!isOpen) return null;

  const subscriptions = data?.subscriptions || [];
  const totalMonthly = data?.totalMonthlyBurden || 0;
  const totalAnnual = data?.totalAnnualBurden || 0;
  const count = data?.count || 0;

  return (
    <div className="subscriptions-modal-backdrop" onClick={onClose}>
      <div className="subscriptions-modal-dialog animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="subscriptions-modal-header">
          <div className="header-title-wrap">
            <div className="header-icon-box">
              <CalendarClock size={20} />
            </div>
            <div>
              <h2>Subscriptions & Regular Bills</h2>
              <p className="subtitle">
                Keep track of your monthly streaming services, memberships, and recurring bills
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Executive Summary Cards */}
        <div className="subscriptions-summary-row">
          <div className="subs-summary-card">
            <span className="subs-card-label">Monthly Subscriptions Total</span>
            <div className="subs-card-value tabular-num">
              <span className="currency-symbol">₹</span>
              {Math.round(totalMonthly).toLocaleString('en-IN')}
              <span className="per-period">/ mo</span>
            </div>
            <span className="subs-card-hint">Total cost of recurring bills every month</span>
          </div>

          <div className="subs-summary-card">
            <span className="subs-card-label">Estimated Yearly Total</span>
            <div className="subs-card-value tabular-num">
              <span className="currency-symbol">₹</span>
              {Math.round(totalAnnual).toLocaleString('en-IN')}
              <span className="per-period">/ yr</span>
            </div>
            <span className="subs-card-hint">What you will spend in a year if sustained</span>
          </div>

          <div className="subs-summary-card">
            <span className="subs-card-label">Active Subscriptions</span>
            <div className="subs-card-value tabular-num">
              {count}
              <span className="per-period"> services</span>
            </div>
            <span className="subs-card-hint">Spotted automatically from regular payments</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="subscriptions-modal-body">
          {isLoading ? (
            <div className="subs-loading-state">
              <RefreshCw className="spin-icon" size={24} />
              <span>Looking for regular subscriptions and bills...</span>
            </div>
          ) : error ? (
            <div className="subs-error-state">
              <AlertCircle size={24} />
              <span>Unable to load subscriptions.</span>
              <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="subs-empty-state">
              <Layers size={36} className="empty-icon" />
              <h3>No Recurring Subscriptions Found Yet</h3>
              <p>
                When you have regular payments (like Netflix, Spotify, gym memberships, or bills) occurring on a schedule, FinTrack will automatically group them here.
              </p>
            </div>
          ) : (
            <div className="subs-table-wrap">
              <table className="subs-table">
                <thead>
                  <tr>
                    <th>Service / Merchant</th>
                    <th>Cycle</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Monthly Cost</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="merchant-name-cell">
                        <div className="merchant-avatar">
                          <CreditCard size={14} />
                        </div>
                        <div>
                          <div className="merchant-title">{sub.merchantName}</div>
                          <div className="merchant-meta">
                            Last charged: {sub.lastDate ? sub.lastDate.substring(0, 10) : 'Recent'} • {sub.occurrences} billing{sub.occurrences > 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`cadence-badge ${sub.cadence}`}>
                          {sub.cadence.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="category-tag">{sub.category}</span>
                      </td>
                      <td className="amount-cell tabular-num" style={{ textAlign: 'right' }}>
                        ₹{Math.round(sub.estimatedCost).toLocaleString('en-IN')}
                      </td>
                      <td className="monthly-cell tabular-num" style={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{Math.round(sub.monthlyEquivalentCost).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div className="confidence-pill" title={`${Math.round(sub.confidence * 100)}% detection certainty`}>
                          <CheckCircle2 size={12} className="confidence-icon" />
                          <span>Active</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="subscriptions-modal-footer">
          <span className="subs-audit-notice">
            Automatically spotted from recurring charges in your bank accounts.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsModal;
