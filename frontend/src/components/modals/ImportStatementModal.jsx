import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { QUERY_KEYS } from '../../lib/queryClient';
import { Upload, CheckCircle2, AlertTriangle, AlertCircle, FileText, X } from 'lucide-react';
import './ImportStatementModal.css';

const ImportStatementModal = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  const { data: accounts = [] } = useQuery({
    queryKey: QUERY_KEYS.accounts,
    queryFn: async () => {
      const res = await api.get('/api/accounts');
      return res.data;
    },
    enabled: isOpen
  });

  const previewMutation = useMutation({
    mutationFn: async ({ accountId, csvContent }) => {
      const res = await api.post('/api/imports/preview', { accountId, csvContent });
      return res.data;
    },
    onSuccess: (data) => {
      setPreviewData(data);
      setError('');
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || err.message || 'Failed to parse CSV statement.');
    }
  });

  const commitMutation = useMutation({
    mutationFn: async ({ accountId, transactions }) => {
      const res = await api.post('/api/imports/commit', { accountId, transactions });
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
      setError(err.response?.data?.error?.message || err.message || 'Failed to commit import to ledger.');
    }
  });

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleInspectPreview = (e) => {
    e.preventDefault();
    if (!accountId) {
      setError('Please select an account for statement reconciliation.');
      return;
    }
    if (!csvContent.trim()) {
      setError('Please upload or paste CSV bank export data.');
      return;
    }
    previewMutation.mutate({ accountId, csvContent });
  };

  const handleCommit = () => {
    if (!previewData || !previewData.preview) return;
    const validOnly = previewData.preview.transactions.filter(t => t.isValid && !t.isDuplicate);
    if (validOnly.length === 0) {
      setError('No valid non-duplicate transactions found to import.');
      return;
    }

    commitMutation.mutate({
      accountId,
      transactions: validOnly.map(t => ({
        date: t.date,
        description: t.description,
        amountMinor: t.amountMinor,
        type: t.type,
        fingerprint: t.fingerprint
      }))
    });
  };

  return (
    <div className="import-modal-backdrop" onClick={onClose}>
      <div className="import-modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="import-modal-header">
          <div>
            <h3>Bank Statement Import & Reconciliation</h3>
            <p className="subtitle">Upload CSV statements with cryptographic duplicate fingerprinting</p>
          </div>
          <button className="import-modal-close" onClick={onClose} aria-label="Close import modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="import-modal-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {!previewData ? (
          <form onSubmit={handleInspectPreview} className="import-modal-form">
            <div className="import-field">
              <label>Reconcile into Account</label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                required
              >
                <option value="">Select target account...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.institution} - ₹{acc.currentBalance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="import-field">
              <label>Upload Statement File (.csv)</label>
              <div className="import-dropzone">
                <Upload size={28} className="dropzone-icon" />
                <p>Click to choose file or paste CSV content below</p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="dropzone-input"
                />
              </div>
            </div>

            <div className="import-field">
              <label>Or Paste Raw CSV Data</label>
              <textarea
                rows={4}
                placeholder="Date,Description,Amount,Type&#10;2026-09-01,Amazon India,2499.00,Debit"
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
              />
            </div>

            <div className="import-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={previewMutation.isPending}
              >
                {previewMutation.isPending ? 'Analyzing & Fingerprinting...' : 'Inspect & Generate Preview'}
              </button>
            </div>
          </form>
        ) : (
          <div className="import-preview-container">
            <div className="import-metrics-bar">
              <div className="import-stat">
                <span className="stat-label">Total Rows</span>
                <span className="stat-value">{previewData.preview.totalRows}</span>
              </div>
              <div className="import-stat valid">
                <span className="stat-label">Valid Inflows/Outflows</span>
                <span className="stat-value">{previewData.preview.validRows}</span>
              </div>
              <div className="import-stat duplicate">
                <span className="stat-label">Duplicates Detected</span>
                <span className="stat-value">{previewData.preview.duplicateRows}</span>
              </div>
              <div className="import-stat invalid">
                <span className="stat-label">Invalid Format</span>
                <span className="stat-value">{previewData.preview.invalidRows}</span>
              </div>
            </div>

            <div className="import-preview-table-wrapper">
              <table className="import-preview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.transactions.slice(0, 50).map((t, idx) => (
                    <tr key={idx} className={t.isDuplicate ? 'is-duplicate-row' : ''}>
                      <td>{t.date.substring(0, 10)}</td>
                      <td>{t.description}</td>
                      <td>
                        <span className={`flow-badge ${t.type}`}>{t.type}</span>
                      </td>
                      <td className="tabular-num">₹{t.amount.toLocaleString('en-IN')}</td>
                      <td>
                        {t.isDuplicate ? (
                          <span className="badge-duplicate">
                            <AlertTriangle size={12} /> Duplicate (98%)
                          </span>
                        ) : t.isValid ? (
                          <span className="badge-ready">
                            <CheckCircle2 size={12} /> Ready
                          </span>
                        ) : (
                          <span className="badge-invalid">
                            <AlertCircle size={12} /> {t.validationError}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="import-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPreviewData(null)}
              >
                Back to Edit
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCommit}
                disabled={commitMutation.isPending || previewData.preview.validRows === 0}
              >
                {commitMutation.isPending
                  ? 'Writing to Ledger...'
                  : `Commit ${previewData.preview.validRows} Verified Transactions`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportStatementModal;
