import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AddIncomeModal from '../components/AddIncomeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaArrowUp,
  FaWallet,
  FaMoneyBillWave,
  FaBriefcase,
  FaGift,
  FaHandHoldingUsd,
  FaChartLine,
  FaPiggyBank
} from 'react-icons/fa';
import './Income.css';

const CATEGORIES = [
  { id: 'salary', name: 'Salary & Payroll', icon: <FaMoneyBillWave />, color: '#10B981' },
  { id: 'freelance', name: 'Client & Consulting', icon: <FaBriefcase />, color: '#38BDF8' },
  { id: 'investments', name: 'Dividends & Capital', icon: <FaChartLine />, color: '#F59E0B' },
  { id: 'gifts', name: 'Grants & Gifts', icon: <FaGift />, color: '#EC4899' },
  { id: 'savings', name: 'Yield & Interest', icon: <FaPiggyBank />, color: '#6366F1' },
  { id: 'other', name: 'Other Receipts', icon: <FaHandHoldingUsd />, color: '#64748B' }
];

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIncomes();
    }
  }, [user]);

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/incomes');
      setIncomes(response.data);
    } catch (err) {
      console.error('Error fetching incomes:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch income records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      setError(null);
      await api.delete(`/api/incomes/${id}`);
      setIncomes((prev) => prev.filter((i) => i._id !== id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting income:', err);
      setError('Failed to delete income record.');
    }
  };

  const handleEdit = (income) => {
    setSelectedIncome(income);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedIncome(null);
    setShowAddModal(true);
  };

  // Filtered & sorted data
  const filteredIncomes = useMemo(() => {
    let result = [...incomes];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (i) => (i.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          (i.title || '').toLowerCase().includes(q) ||
          (i.category || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });

    return result;
  }, [incomes, selectedCategory, searchQuery, sortBy]);

  // Analytical Metrics
  const metrics = useMemo(() => {
    const total = filteredIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const count = filteredIncomes.length;
    const avg = count > 0 ? total / count : 0;
    const max = filteredIncomes.reduce((m, i) => (i.amount > m ? i.amount : m), 0);
    return { total, count, avg, max };
  }, [filteredIncomes]);

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
    <div className="income-container">
      {/* Header */}
      <div className="income-header">
        <div>
          <h1>Inflow Ledger</h1>
          <p>Verified capital deposits, revenue streams, and incoming liquidity</p>
        </div>
        <button className="add-income-btn" onClick={handleAdd}>
          <FaPlus /> Record Inflow
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="ledger-metrics-strip">
        <div className="ledger-metric-card">
          <div className="ledger-metric-header">
            <span className="ledger-metric-label">Total Inflow</span>
            <FaArrowUp className="ledger-metric-icon" />
          </div>
          <div className="ledger-metric-value">{formatCurrency(metrics.total)}</div>
          <span className="ledger-metric-sub">{metrics.count} settled receipts</span>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-header">
            <span className="ledger-metric-label">Average Inflow</span>
            <FaWallet className="ledger-metric-icon" />
          </div>
          <div className="ledger-metric-value">{formatCurrency(metrics.avg)}</div>
          <span className="ledger-metric-sub">Per receipt entry</span>
        </div>

        <div className="ledger-metric-card">
          <div className="ledger-metric-header">
            <span className="ledger-metric-label">Peak Receipt</span>
            <FaTag className="ledger-metric-icon" />
          </div>
          <div className="ledger-metric-value">{formatCurrency(metrics.max)}</div>
          <span className="ledger-metric-sub">Largest single stream</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="ledger-controls-bar">
        <div className="ledger-search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search inflow sources, payors, descriptions..."
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
            <option value="title-asc">Source Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="ledger-category-pills">
        <button
          className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Streams ({incomes.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = incomes.filter((i) => (i.category || '').toLowerCase() === cat.id).length;
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

      {/* Financial Table / Ledger */}
      <div className="ledger-table-container">
        {filteredIncomes.length > 0 ? (
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Date</th>
                <th>Source / Description</th>
                <th style={{ width: '190px' }}>Stream Category</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ width: '150px', textAlign: 'right' }}>Amount</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.map((income) => {
                const catMeta = getCategoryMeta(income.category);
                const formattedDate = new Date(income.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <tr key={income._id} className="ledger-row">
                    <td className="ledger-cell-date">{formattedDate}</td>
                    <td className="ledger-cell-desc">
                      <span className="ledger-desc-text">{income.title || 'Inflow Stream'}</span>
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
                    <td className="ledger-cell-amount income-positive">
                      +{formatCurrency(income.amount)}
                    </td>
                    <td className="ledger-cell-actions">
                      <button
                        className="ledger-action-btn edit"
                        title="Edit Entry"
                        onClick={() => handleEdit(income)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="ledger-action-btn delete"
                        title="Delete Entry"
                        onClick={() => {
                          setSelectedIncome(income);
                          setShowDeleteModal(true);
                        }}
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
            <FaMoneyBillWave className="empty-state-icon" />
            <h3>No Inflow Records Found</h3>
            <p>
              {searchQuery || selectedCategory !== 'all'
                ? 'No transactions matched your active filter criteria.'
                : 'Your inflow ledger is currently empty. Record your first income receipt to track capital growth.'}
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
        <AddIncomeModal
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedIncome(null);
          }}
          onAddIncome={fetchIncomes}
          income={showEditModal ? selectedIncome : null}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => handleDelete(selectedIncome?._id)}
          title="Delete Income"
          message="Are you sure you want to remove this record from the inflow ledger?"
          itemName={selectedIncome?.title}
        />
      )}
    </div>
  );
};

export default Income;
