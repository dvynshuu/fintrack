import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaPiggyBank, FaLightbulb, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import ExpenseSummary from '../components/ExpenseSummary';
import BudgetProgress from '../components/BudgetProgress';
import AddExpenseModal from '../components/AddExpenseModal';
import Footer from '../components/Footer';
import { useExpenses } from '../contexts/ExpenseContext';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

const DEFAULT_FINANCIAL_HEALTH = {
  savingsRate: 0,
  emergencyFund: 0,
  debtToIncome: 0,
  investmentGrowth: 0
};

const DEFAULT_SUGGESTIONS = [
  {
    title: "Track Your Expenses",
    description: "Start by adding your daily expenses to get a better understanding of your spending habits.",
    action: {
      text: "Add Expense",
      link: "/expenses"
    }
  },
  {
    title: "Set Budget Goals",
    description: "Create budget goals to help you save more and spend wisely.",
    action: {
      text: "Set Goals",
      link: "/goals"
    }
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { expenses, loading: expensesLoading } = useExpenses();
  const [loading, setLoading] = useState(true);
  const [expenseData, setExpenseData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [financialHealth, setFinancialHealth] = useState(DEFAULT_FINANCIAL_HEALTH);
  const [smartSuggestions, setSmartSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [totalExpenses, setTotalExpenses] = useState(0);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Process expenses data for the dashboard
        const processedExpenses = expenses.map(expense => ({
          _id: expense._id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date
        }));

        // Group expenses by category for the pie chart
        const groupedExpenses = processedExpenses.reduce((acc, expense) => {
          const category = expense.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += expense.amount;
          return acc;
        }, {});

        const expenseData = Object.entries(groupedExpenses).map(([category, amount]) => ({
          name: category,
          value: amount
        }));

        setExpenseData(expenseData);

        // Calculate total expenses
        const total = processedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpenses(total);
        console.log('Total expenses:', total);

        // Fetch monthly data
        try {
          const monthlyResponse = await api.get('/api/expenses/monthly');
          setMonthlyData(monthlyResponse.data);
        } catch (err) {
          console.warn('Could not fetch monthly data:', err);
          setMonthlyData([]);
        }

        // Set default values for financial health and suggestions
        setFinancialHealth(DEFAULT_FINANCIAL_HEALTH);
        setSmartSuggestions(DEFAULT_SUGGESTIONS);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [expenses]); // Re-run when expenses change

  const handleAddExpense = async () => {
    console.log('Refreshing data after adding expense...');
    await fetchDashboardData();
    setShowAddExpense(false);
  };

  // Get current month's data
  const currentMonthData = monthlyData[monthlyData.length - 1] || { expenses: 0, income: 0 };
  const previousMonthData = monthlyData[monthlyData.length - 2] || { expenses: 0, income: 0 };

  // Calculate percentage changes
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const expenseChange = calculateChange(totalExpenses, previousMonthData.expenses);
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Calculate financial health score
  const healthScore = Math.round(
    (financialHealth.savingsRate + 
     financialHealth.emergencyFund + 
     (100 - financialHealth.debtToIncome) + 
     financialHealth.investmentGrowth) / 4
  );
  
  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome to Your Financial Dashboard</h1>
          <p className="dashboard-description">
            Track your expenses and budget goals in one place. 
            Get insights into your spending patterns and stay on top of your financial goals.
          </p>
          <div className="dashboard-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddExpense(true)}
            >
              Add New Expense
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/goals')}
            >
              Set Budget Goals
            </button>
          </div>
        </div>

        {showAddExpense && (
          <AddExpenseModal
            onClose={() => setShowAddExpense(false)}
            onAddExpense={handleAddExpense}
          />
        )}

        <div className="summary-cards">
          <div className="summary-card expenses">
            <h3>Total Expenses</h3>
            <p className="amount">₹{totalExpenses.toFixed(2)}</p>
            <div className={`change ${expenseChange >= 0 ? 'positive' : 'negative'}`}>
              <span>{expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%</span>
              <span className="change-period">vs last month</span>
            </div>
          </div>

          <div className="summary-card income">
            <h3>Total Income</h3>
            <p className="amount">₹{currentMonthData.income?.toFixed(2) || '0.00'}</p>
            <div className={`change ${calculateChange(currentMonthData.income, previousMonthData.income) >= 0 ? 'positive' : 'negative'}`}>
              <span>{calculateChange(currentMonthData.income, previousMonthData.income) >= 0 ? '+' : ''}{calculateChange(currentMonthData.income, previousMonthData.income).toFixed(1)}%</span>
              <span className="change-period">vs last month</span>
            </div>
          </div>

          <div className="summary-card savings">
            <h3>Total Savings</h3>
            <p className="amount">
              {currentMonthData.income ? 
                `${((currentMonthData.income - totalExpenses) / currentMonthData.income * 100).toFixed(1)}%` : 
                '0.0%'}
            </p>
            <div className={`change ${calculateChange(
              (currentMonthData.income - totalExpenses) / currentMonthData.income,
              (previousMonthData.income - previousMonthData.expenses) / previousMonthData.income
            ) >= 0 ? 'positive' : 'negative'}`}>
              <span>{calculateChange(
                (currentMonthData.income - totalExpenses) / currentMonthData.income,
                (previousMonthData.income - previousMonthData.expenses) / previousMonthData.income
              ) >= 0 ? '+' : ''}{calculateChange(
                (currentMonthData.income - totalExpenses) / currentMonthData.income,
                (previousMonthData.income - previousMonthData.expenses) / previousMonthData.income
              ).toFixed(1)}%</span>
              <span className="change-period">vs last month</span>
            </div>
          </div>
        </div>

        <div className="dashboard-charts">
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            <p className="chart-description">
              Visualize your spending patterns across different categories. 
              This helps identify areas where you might be overspending and opportunities for better budget allocation.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Monthly Expenses</h3>
            <p className="chart-description">
              Track your spending trends over time. 
              Compare monthly expenses to identify patterns and make informed decisions about your budget.
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="expenses" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="financial-health-section">
          <div className="health-header">
            <h2>Financial Health Score</h2>
            <div className="health-score">
              <div className="score-circle">
                <span className="score-value">{healthScore}</span>
                <span className="score-label">/100</span>
              </div>
              <p className="score-description">Your overall financial health score</p>
            </div>
          </div>

          <div className="health-metrics">
            <div className="metric-card">
              <div className="metric-icon savings">
                <FaPiggyBank />
              </div>
              <div className="metric-content">
                <h4>Savings Rate</h4>
                <div className="metric-value">{financialHealth.savingsRate}%</div>
                <div className="metric-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${financialHealth.savingsRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon emergency">
                <FaExclamationTriangle />
              </div>
              <div className="metric-content">
                <h4>Emergency Fund</h4>
                <div className="metric-value">{financialHealth.emergencyFund}%</div>
                <div className="metric-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${financialHealth.emergencyFund}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon debt">
                <FaChartLine />
              </div>
              <div className="metric-content">
                <h4>Debt-to-Income</h4>
                <div className="metric-value">{financialHealth.debtToIncome}%</div>
                <div className="metric-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${financialHealth.debtToIncome}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon investment">
                <FaChartLine />
              </div>
              <div className="metric-content">
                <h4>Investment Growth</h4>
                <div className="metric-value">{financialHealth.investmentGrowth}%</div>
                <div className="metric-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${financialHealth.investmentGrowth}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="smart-suggestions">
            <h3>Smart Suggestions</h3>
            <div className="suggestions-grid">
              {smartSuggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-card">
                  <div className="suggestion-icon">
                    <FaLightbulb />
                  </div>
                  <div className="suggestion-content">
                    <h4>{suggestion.title}</h4>
                    <p>{suggestion.description}</p>
                    {suggestion.action && (
                      <button 
                        className="action-btn"
                        onClick={() => navigate(suggestion.action.link)}
                      >
                        {suggestion.action.text}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;