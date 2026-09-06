import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';

import './AddIncomeModal.css';

const sources = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Rental',
  'Other'
];

const AddIncomeModal = ({ onClose, onAddIncome, income }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (income) {
      setFormData({
        title: income.title,
        amount: income.amount.toString(),
        category: income.category,
        date: new Date(income.date).toISOString().split('T')[0],
        notes: income.notes || ''
      });
    }
  }, [income]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate amount
      if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Send API request
      const payload = {
        ...formData,
        description: formData.title,
        amount: parseFloat(formData.amount)
      };

      if (income && (income._id || income.id)) {
        // Update existing income
        await api.put(`/api/incomes/${income._id || income.id}`, payload);
      } else {
        // Create new income
        await api.post('/api/incomes', payload);
      }

      // Close modal and refresh data
      onAddIncome();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error?.message ||
                  err.response?.data?.error?.details?.[0]?.message ||
                  err.response?.data?.message ||
                  err.message ||
                  'Failed to save income';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{income ? 'Edit Income' : 'Add New Income'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <form id="add-income-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Source description"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Source</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add some details..."
                rows="3"
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            form="add-income-form"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (income ? 'Update Income' : 'Add Income')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddIncomeModal; 