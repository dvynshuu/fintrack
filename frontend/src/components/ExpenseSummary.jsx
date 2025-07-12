import React, { useState, useEffect } from 'react';
import { formatCurrency, sumByCategory } from '../utils/formatters';
import api from '../utils/api';
import './ExpenseSummary.css';

const ExpenseSummary = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // month, week, year

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/expenses/summary?timeRange=${timeRange}`);
        setExpenses(response.data);
      } catch (err) {
        console.error('Error fetching expenses', err);
        setError('Failed to load expense data');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [timeRange]);

  const categoryTotals = sumByCategory(expenses);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="expense-summary loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-summary error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="expense-summary">
      <div className="summary-header">
        <h2>Expense Summary</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="summary-content">
        <div className="total-expenses">
          <h3>Total Expenses</h3>
          <p className="amount">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="category-breakdown">
          <h3>By Category</h3>
          <div className="category-list">
            {categoryTotals.map(({ category, amount }) => (
              <div key={category} className="category-item">
                <div className="category-info">
                  <span className="category-name">{category}</span>
                  <span className="category-amount">{formatCurrency(amount)}</span>
                </div>
                <div className="category-percentage">
                  {((amount / totalExpenses) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-expenses">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {recentExpenses.map(expense => (
              <div key={expense._id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-title">{expense.title}</span>
                  <span className="transaction-category">{expense.category}</span>
                </div>
                <div className="transaction-amount">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
