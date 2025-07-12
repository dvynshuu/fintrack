import React, { useState, useEffect } from 'react';
import { formatCurrency, calculatePercentage } from '../utils/formatters';
import api from '../utils/api';
import './BudgetProgress.css';

const BudgetProgress = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const response = await api.get('/budgets');
        setBudgets(response.data);
      } catch (err) {
        console.error('Error fetching budgets', err);
        setError('Failed to load budget data');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  if (loading) {
    return (
      <div className="budget-progress loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-progress error">
        <p>{error}</p>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="budget-progress empty">
        <p>No budgets set up yet</p>
      </div>
    );
  }

  return (
    <div className="budget-progress">
      <h2>Budget Progress</h2>
      <div className="budget-list">
        {budgets.map(budget => {
          const percentage = calculatePercentage(budget.spent, budget.limit);
          const isOverBudget = percentage > 100;
          const progressColor = isOverBudget ? '#ff4d4d' : '#4CAF50';

          return (
            <div key={budget._id} className="budget-item">
              <div className="budget-header">
                <h3>{budget.category}</h3>
                <span className="budget-amount">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: progressColor
                  }}
                />
              </div>
              
              <div className="budget-details">
                <span className="percentage">
                  {percentage.toFixed(1)}%
                </span>
                {isOverBudget && (
                  <span className="over-budget">
                    Over budget by {formatCurrency(budget.spent - budget.limit)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress; 