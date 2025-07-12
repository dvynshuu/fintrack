import React, { useState, useEffect } from 'react';
import api from '../utils/api';

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
    source: 'Salary',
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
        source: income.source,
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
      if (income) {
        // Update existing income
        await api.put(`/income/${income._id}`, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      } else {
        // Create new income
        await api.post('/income', {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      
      // Close modal and refresh data
      onAddIncome();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{income ? 'Edit Income' : 'Add New Income'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
            >
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
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
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (income ? 'Update Income' : 'Add Income')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal; 