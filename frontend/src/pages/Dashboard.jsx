import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';
import api from '../utils/api';
import BalanceCard from '../components/dashboard/BalanceCard';
import MetricCard from '../components/dashboard/MetricCard';
import LineChart from '../components/dashboard/LineChart';
import DonutChart from '../components/dashboard/DonutChart';
import TransactionTable from '../components/dashboard/TransactionTable';
import AddExpenseModal from '../components/AddExpenseModal';
import FinancialScore from '../components/FinancialScore';
import { useExpenses } from '../contexts/ExpenseContext';
import './Dashboard.css';

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
    action: { text: "Add Expense", link: "/expenses" }
  },
  {
    title: "Set Budget Goals",
    description: "Create budget goals to help you save more and spend wisely.",
    action: { text: "Set Goals", link: "/goals" }
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
  const [goals, setGoals] = useState([]);
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const processedExpenses = expenses.map(expense => ({
          _id: expense._id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date
        }));

        // Group expenses by category for donut chart
        const groupedExpenses = processedExpenses.reduce((acc, expense) => {
          const category = expense.category;
          if (!acc[category]) acc[category] = 0;
          acc[category] += expense.amount;
          return acc;
        }, {});

        const expData = Object.entries(groupedExpenses).map(([category, amount]) => ({
          name: category,
          value: amount
        }));
        setExpenseData(expData);

        // Calculate total expenses for current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthExpenses = processedExpenses.filter(expense => {
          const d = new Date(expense.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        setTotalExpenses(total);

        // Fetch goals
        let fetchedGoals = [];
        try {
          const goalsResponse = await api.get('/api/goals');
          fetchedGoals = goalsResponse.data;
          setGoals(fetchedGoals);
        } catch (err) {
          console.warn('Could not fetch goals:', err);
        }

        // Fetch incomes
        let fetchedIncomes = [];
        try {
          const incomesResponse = await api.get('/api/incomes');
          fetchedIncomes = incomesResponse.data;
          setIncomes(fetchedIncomes);
        } catch (err) {
          console.warn('Could not fetch incomes:', err);
        }

        // Fetch monthly data
        let monthlyDataFetched = [];
        try {
          const monthlyResponse = await api.get('/api/expenses/monthly');
          monthlyDataFetched = monthlyResponse.data;
          setMonthlyData(monthlyDataFetched);
        } catch (err) {
          console.warn('Could not fetch monthly data:', err);
          setMonthlyData([]);
        }

        // Calculate financial health
        if (monthlyDataFetched.length > 0) {
          const cm = monthlyDataFetched[monthlyDataFetched.length - 1];
          const totalIncome = cm.income || 0;
          const totalExp = cm.expenses || 0;

          const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExp) / totalIncome) * 100) : 0;

          const avgExpenses = monthlyDataFetched.reduce((acc, curr) => acc + curr.expenses, 0) / monthlyDataFetched.length;
          const targetEmergencyFund = Math.max(avgExpenses * 6, 100000);
          const currentEmergencySavings = fetchedGoals
            .filter(g => g.title.toLowerCase().includes('emergency') || (g.category && g.category.toLowerCase() === 'house'))
            .reduce((acc, curr) => acc + curr.currentAmount, 0);
          const emergencyFund = Math.min(100, (currentEmergencySavings / targetEmergencyFund) * 100);

          const investmentAmount = fetchedIncomes
            .filter(i => i.category && i.category.toLowerCase() === 'investments')
            .reduce((acc, curr) => acc + curr.amount, 0);
          const investmentGrowth = totalIncome > 0 ? Math.min(100, (investmentAmount / totalIncome) * 100) : 0;

          const debtAmount = processedExpenses
            .filter(e => e.category && (e.category.toLowerCase().includes('loan') || e.category.toLowerCase().includes('debt')))
            .reduce((acc, curr) => acc + curr.amount, 0);
          const debtToIncome = totalIncome > 0 ? Math.min(100, (debtAmount / totalIncome) * 100) : 0;

          setFinancialHealth({
            savingsRate: Math.round(savingsRate),
            emergencyFund: Math.round(emergencyFund),
            debtToIncome: Math.round(debtToIncome),
            investmentGrowth: Math.round(investmentGrowth)
          });
        } else {
          setFinancialHealth(DEFAULT_FINANCIAL_HEALTH);
        }

        setSmartSuggestions(DEFAULT_SUGGESTIONS);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [expenses]);

  // Derived data
  const currentMonthData = monthlyData[monthlyData.length - 1] || { expenses: 0, income: 0 };
  const previousMonthData = monthlyData[monthlyData.length - 2] || { expenses: 0, income: 0 };

  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const expenseChange = calculateChange(totalExpenses, previousMonthData.expenses);
  const incomeChange = calculateChange(currentMonthData.income, previousMonthData.income);

  // Balance = total income - total expenses (current month)
  const balance = (currentMonthData.income || 0) - totalExpenses;
  const prevBalance = (previousMonthData.income || 0) - (previousMonthData.expenses || 0);
  const balanceChange = calculateChange(balance, prevBalance);

  // Average metrics
  const avgIncome = monthlyData.length > 0
    ? monthlyData.reduce((s, d) => s + (d.income || 0), 0) / monthlyData.length
    : 0;
  const avgExpenses = monthlyData.length > 0
    ? monthlyData.reduce((s, d) => s + (d.expenses || 0), 0) / monthlyData.length
    : 0;

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Health score
  const healthScore = Math.round(
    (financialHealth.savingsRate +
      financialHealth.emergencyFund +
      (100 - financialHealth.debtToIncome) +
      financialHealth.investmentGrowth) / 4
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        {/* Welcome Section */}
        <div className="dashboard-welcome animate-slide-up">
          <h1>{getGreeting()}</h1>
          <p className="dashboard-subtitle">This is your finance report</p>
        </div>

        {/* Top Cards Row */}
        <div className="dashboard-top-row">
          <div className="dashboard-top-left">
            <BalanceCard
              balance={balance}
              change={balanceChange}
              onAddExpense={() => setShowAddExpense(true)}
            />

            <div className="dashboard-metrics-row">
              <MetricCard
                title="Monthly income"
                amount={currentMonthData.income || 0}
                change={incomeChange}
                type="income"
                icon={<FaArrowTrendUp />}
                delay={120}
              />
              <MetricCard
                title="Monthly expenses"
                amount={totalExpenses}
                change={expenseChange}
                type="expense"
                icon={<FaArrowTrendDown />}
                delay={240}
              />
            </div>
          </div>

          {/* Donut Sidebar */}
          <div className="dashboard-donut-panel" style={{ animationDelay: '300ms' }}>
            <div className="dashboard-card">
              <h3 className="dashboard-card__title">All Expenses</h3>
              <DonutChart data={expenseData} size={160} />
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="dashboard-stats-row">
          <div className="dashboard-card dashboard-card--chart">
            <div className="dashboard-card__header">
              <h3 className="dashboard-card__title">Statistics</h3>
              <div className="dashboard-chart-legend">
                <span className="dashboard-chart-legend__item">
                  <span className="dashboard-chart-legend__dot" style={{ background: 'var(--chart-income)' }} />
                  Total income
                </span>
                <span className="dashboard-chart-legend__item">
                  <span className="dashboard-chart-legend__dot" style={{ background: 'var(--chart-expense)' }} />
                  Total expenses
                </span>
              </div>
            </div>
            <LineChart data={monthlyData} height={280} />
          </div>
        </div>


        {/* Average Metrics */}
        <div className="dashboard-averages">
          <div className="dashboard-card dashboard-avg-card">
            <span className="dashboard-avg-label">Average income</span>
            <span className="dashboard-avg-value">
              ₹{avgIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`dashboard-avg-change ${incomeChange >= 0 ? 'positive' : 'negative'}`}>
              {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% compare to last month
            </span>
          </div>
          <div className="dashboard-card dashboard-avg-card">
            <span className="dashboard-avg-label">Average expenses</span>
            <span className="dashboard-avg-value">
              ₹{avgExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`dashboard-avg-change ${expenseChange >= 0 ? 'positive' : 'negative'}`}>
              {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% compare to last month
            </span>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="dashboard-card dashboard-card--transactions">
          <div className="dashboard-card__header">
            <div>
              <h3 className="dashboard-card__title">Transaction and invoices</h3>
              <p className="dashboard-card__subtitle">Stay updated on recent financial activities</p>
            </div>
          </div>
          <TransactionTable expenses={expenses} />
        </div>

        {/* Financial Score */}
        <FinancialScore
          healthScore={healthScore}
          financialHealth={financialHealth}
          smartSuggestions={smartSuggestions}
        />

        {showAddExpense && (
          <AddExpenseModal
            onClose={() => setShowAddExpense(false)}
            onAddExpense={() => setShowAddExpense(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;