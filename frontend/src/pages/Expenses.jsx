import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useExpenses } from '../contexts/ExpenseContext';
import AddExpenseModal from '../components/AddExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCalendarAlt,
  FaTag,
  FaReceipt,
  FaWallet,
  FaUtensils,
  FaHome,
  FaCar,
  FaShoppingBag,
  FaHeartbeat,
  FaGamepad,
  FaGraduationCap,
  FaPlane,
  FaGift,
  FaBolt
} from 'react-icons/fa';
import './Expenses.css';

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: <FaUtensils />, color: '#10B981' },
  { id: 'housing', name: 'Housing', icon: <FaHome />, color: '#38BDF8' },
  { id: 'transportation', name: 'Transportation', icon: <FaCar />, color: '#F59E0B' },
  { id: 'shopping', name: 'Shopping', icon: <FaShoppingBag />, color: '#6366F1' },
  { id: 'healthcare', name: 'Healthcare', icon: <FaHeartbeat />, color: '#F43F5E' },
  { id: 'entertainment', name: 'Entertainment', icon: <FaGamepad />, color: '#A855F7' },
  { id: 'education', name: 'Education', icon: <FaGraduationCap />, color: '#14B8A6' },
  { id: 'travel', name: 'Travel', icon: <FaPlane />, color: '#EC4899' },
  { id: 'utilities', name: 'Utilities', icon: <FaBolt />, color: '#EAB308' },
  { id: 'gifts', name: 'Gifts', icon: <FaGift />, color: '#F97316' },
  { id: 'other', name: 'Other', icon: <FaTag />, color: '#64748B' }
];

const Expenses = () => {
  const { user } = useAuth();
  const { expenses, loading, error, fetchExpenses, deleteExpense } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Derived filtered & sorted expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(
        (e) => (e.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          (e.description || '').toLowerCase().includes(q) ||
          (e.category || '').toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      if (sortBy === 'title-asc') return (a.description || '').localeCompare(b.description || '');
      return 0;
    });

    return result;
  }, [expenses, selectedCategory, searchQuery, sortBy]);

  // Analytical Metrics
  const metrics = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const count = filteredExpenses.length;
    const avg = count > 0 ? total / count : 0;

    // Largest expense
    const max = filteredExpenses.reduce((m, e) => (e.amount > m ? e.amount : m), 0);

    return { total, count, avg, max };
  }, [filteredExpenses]);

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await deleteExpense(id);
      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const confirmDelete = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedExpense(null);
    setShowAddModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getCategoryMeta = (category) => {
    const key = (category || '').toLowerCase().trim();
    const found = CATEGORIES.find(
      (c) => c.id === key || key.includes(c.id) || c.id.includes(key) || c.name.toLowerCase() === key
    );
    return found || { name: category || 'Other', icon: <FaTag />, color: '#64748B' };
  };

  return (
    <div className="expenses-container">
      {/* Page Header */}
      <div className="expenses-header">
        <div>
          <h1>Expenses & Purchases</h1>
          <p>Track what you spend, organize categories, and review your purchase history</p>
        </div>
        <button className="add-expense-btn" onClick={handleAdd}>
          <FaPlus /> + Add Expense
        </button>
      </div>

      {/* Ledger Metrics Strip */}
      <div className="ledger-metrics-strip">
        <div className="ledger-metric-card">
          <div className="ledger-metric-header">
            <span className="ledger-metric-label">Total Spent</span>
            <FaReceipt className="ledger-metric-icon" />
          </div>
          <div className="ledger-metric-value">{formatCurrency(metrics.total)}</div>
          <span className="ledger-metric-sub">{metrics.count} expenses</span>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-header">
            <span className="ledger-metric-label">Average Expense</span>
            <FaWallet className="ledger-metric-icon" />
          </div>
          <div className="ledger-metric-value">{formatCurrency(metrics.avg)}</div>
          <span className="ledger-metric-sub">Per purchase</span>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-header">
            <span className="ledger-metric-label">Largest Purchase</span>
            <FaTag className="ledger-metric-icon" />
          </div>
          <div className="ledger-metric-value">{formatCurrency(metrics.max)}</div>
          <span className="ledger-metric-sub">Single highest expense</span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="ledger-controls-bar">
        <div className="ledger-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions by merchant, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="ledger-sort-box">
          <FaCalendarAlt className="sort-icon" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="title-asc">Description (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="ledger-category-pills">
        <button
          className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All ({expenses.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = expenses.filter((e) => (e.category || '').toLowerCase() === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="pill-dot" style={{ background: cat.color }} />
              {cat.name} {count > 0 && <span className="pill-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Interactive Financial Table / Ledger */}
      <div className="ledger-table-container">
        {filteredExpenses.length > 0 ? (
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Date</th>
                <th>Description</th>
                <th style={{ width: '170px' }}>Category</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Amount</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const catMeta = getCategoryMeta(expense.category);
                const formattedDate = new Date(expense.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <tr key={expense._id} className="ledger-row">
                    <td className="ledger-cell-date">{formattedDate}</td>
                    <td className="ledger-cell-desc">
                      <span className="ledger-desc-text">{expense.description || 'Expense Entry'}</span>
                    </td>
                    <td className="ledger-cell-category">
                      <span className="category-tag">
                        <span className="category-tag-icon" style={{ color: catMeta.color }}>
                          {catMeta.icon}
                        </span>
                        {catMeta.name}
                      </span>
                    </td>
                    <td className="ledger-cell-status">
                      <span className="status-pill settled">Settled</span>
                    </td>
                    <td className="ledger-cell-amount">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="ledger-cell-actions">
                      <button
                        className="ledger-action-btn edit"
                        title="Edit Entry"
                        onClick={() => handleEdit(expense)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="ledger-action-btn delete"
                        title="Delete Entry"
                        onClick={() => confirmDelete(expense)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="ledger-empty-state">
            <FaReceipt className="empty-state-icon" />
            <h3>No Expenses Found</h3>
            <p>
              {searchQuery || selectedCategory !== 'all'
                ? 'No expenses matched your search or category filter.'
                : 'You haven\'t recorded any expenses yet. Tap "+ Add Expense" above to add your first purchase!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                className="ledger-btn-reset"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <AddExpenseModal
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
          onAddExpense={fetchExpenses}
          expense={showEditModal ? selectedExpense : null}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && expenseToDelete && (
        <DeleteConfirmModal
          onClose={() => {
            setShowDeleteModal(false);
            setExpenseToDelete(null);
          }}
          onDelete={() => handleDelete(expenseToDelete._id)}
          title="Delete Expense"
          message="Are you sure you want to remove this record from the ledger?"
          itemName={expenseToDelete.description || expenseToDelete.title}
        />
      )}
    </div>
  );
};

export default Expenses;