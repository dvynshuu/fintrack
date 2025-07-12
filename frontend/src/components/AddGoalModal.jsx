import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './AddGoalModal.css';

const goalTypes = [
  'Savings',
  'Debt Reduction',
  'Investment',
  'Emergency Fund',
  'Major Purchase',
  'Other'
];

const AddGoalModal = ({ onClose, onAddGoal, goal }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Savings',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    status: 'Not Started',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        type: goal.type,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
        status: goal.status,
        notes: goal.notes || ''
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Please enter a goal title');
    }
    if (!formData.targetAmount || isNaN(formData.targetAmount) || parseFloat(formData.targetAmount) <= 0) {
      throw new Error('Please enter a valid target amount');
    }
    if (!formData.currentAmount || isNaN(formData.currentAmount) || parseFloat(formData.currentAmount) < 0) {
      throw new Error('Please enter a valid current amount');
    }
    if (!formData.targetDate) {
      throw new Error('Please select a target date');
    }
    if (new Date(formData.targetDate) < new Date()) {
      throw new Error('Target date cannot be in the past');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      validateForm();

      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount)
      };

      if (goal) {
        // Update existing goal
        await api.put(`/goals/${goal._id}`, goalData);
      } else {
        // Create new goal
        await api.post('/goals', goalData);
      }

      onAddGoal();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{goal ? 'Edit Goal' : 'Add New Goal'}</h2>
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
              placeholder="Enter goal title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {goalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetAmount">Target Amount (₹)</label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentAmount">Current Amount (₹)</label>
              <input
                type="number"
                id="currentAmount"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="targetDate">Target Date</label>
            <input
              type="date"
              id="targetDate"
              name="targetDate"
              value={formData.targetDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes about your goal"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (goal ? 'Update Goal' : 'Add Goal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal; 