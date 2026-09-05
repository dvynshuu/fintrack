import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { QUERY_KEYS } from '../../lib/queryClient';
import { ArrowRight, AlertCircle, X } from 'lucide-react';
import './TransferModal.css';

const TransferModal = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const { data: accounts = [] } = useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: async () => {
      const res = await api.get('/api/accounts');
      return res.data;
    },
    enabled: isOpen
  });

  const transferMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/api/transactions/transfer', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || err.message || 'Failed to execute transfer.');
    }
  });

  if (!isOpen) return null;

  const srcAcc = accounts.find(a => a.id === sourceAccountId);
  const destAcc = accounts.find(a => a.id === destinationAccountId);
  const transferNum = parseFloat(amount) || 0;

  const srcAfter = srcAcc ? (srcAcc.currentBalance - transferNum) : 0;
  const destAfter = destAcc ? (destAcc.currentBalance + transferNum) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!sourceAccountId || !destinationAccountId) {
      setError('Please select both source and destination accounts.');
      return;
    }
    if (sourceAccountId === destinationAccountId) {
      setError('Source and destination accounts must be different.');
      return;
    }
    if (transferNum <= 0) {
      setError('Please enter a positive transfer amount.');
      return;
    }

    transferMutation.mutate({
      sourceAccountId,
      destinationAccountId,
      amount: transferNum,
      date: new Date().toISOString(),
      notes
    });
  };

  return (
    <div className="transfer-modal-backdrop" onClick={onClose}>
      <div className="transfer-modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="transfer-modal-header">
          <div>
            <h3>Account-to-Account Transfer</h3>
            <p className="subtitle">Execute a balanced double-entry movement across internal accounts</p>
          </div>
          <button className="transfer-modal-close" onClick={onClose} aria-label="Close transfer modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="transfer-modal-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="transfer-modal-form">
          <div className="transfer-accounts-grid">
            <div className="transfer-field">
              <label>Source Account (Outflow)</label>
              <select
                value={sourceAccountId}
                onChange={e => setSourceAccountId(e.target.value)}
                required
              >
                <option value="">Select origin account...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="transfer-arrow-icon">
              <ArrowRight size={20} />
            </div>

            <div className="transfer-field">
              <label>Destination Account (Inflow)</label>
              <select
                value={destinationAccountId}
                onChange={e => setDestinationAccountId(e.target.value)}
                required
              >
                <option value="">Select target account...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} disabled={acc.id === sourceAccountId}>
                    {acc.name} (₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="transfer-field">
            <label>Transfer Amount (INR)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 25000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="transfer-field">
            <label>Transfer Memo / Narration</label>
            <input
              type="text"
              placeholder="e.g. Monthly savings allocation to ICICI"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Real-time Ledger Preview */}
          {srcAcc && destAcc && transferNum > 0 && (
            <div className="transfer-preview-box">
              <div className="transfer-preview-row">
                <span>{srcAcc.name} Balance:</span>
                <span className="tabular-num">₹{srcAcc.currentBalance.toLocaleString('en-IN')} → <strong>₹{srcAfter.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="transfer-preview-row">
                <span>{destAcc.name} Balance:</span>
                <span className="tabular-num">₹{destAcc.currentBalance.toLocaleString('en-IN')} → <strong>₹{destAfter.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="transfer-preview-badge">
                Net Worth Impact: ₹0.00 (Balanced Capital Flow)
              </div>
            </div>
          )}

          <div className="transfer-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? 'Executing Ledger Movement...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
