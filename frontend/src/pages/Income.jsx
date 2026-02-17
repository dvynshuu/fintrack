import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMoneyBillWave,
  FaBriefcase,
  FaGift,
  FaHandHoldingUsd,
  FaChartLine,
  FaPiggyBank,
  FaWallet,
  FaCreditCard,
  FaUniversity,
  FaChartPie
} from 'react-icons/fa';
import './Income.css';

import api from '../utils/api';
import AddIncomeModal from '../components/AddIncomeModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const categories = [
    { id: 'salary', name: 'Salary', icon: <FaMoneyBillWave />, color: '#10B981' },
    { id: 'freelance', name: 'Freelance', icon: <FaBriefcase />, color: '#3B82F6' },
    { id: 'investments', name: 'Investments', icon: <FaChartLine />, color: '#8B5CF6' },
    { id: 'gifts', name: 'Gifts', icon: <FaGift />, color: '#EC4899' },
    { id: 'savings', name: 'Savings', icon: <FaPiggyBank />, color: '#F59E0B' },
    { id: 'other', name: 'Other', icon: <FaHandHoldingUsd />, color: '#6B7280' }
  ];

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
      setError(err.response?.data?.message || err.message || 'Failed to fetch incomes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError('Invalid income ID');
      return;
    }

    try {
      setError(null);
      await api.delete(`/api/incomes/${id}`);
      setIncomes(prevIncomes => prevIncomes.filter(income => income._id !== id));
    } catch (err) {
      console.error('Error deleting income:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete income. Please try again later.');
    }
  };

  const handleEdit = (income) => {
    if (!income) {
      setError('Invalid income data');
      return;
    }

    setSelectedIncome(income);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedIncome(null);
    setShowAddModal(true);
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const foundCategory = categories.find(cat => cat.id === category.toLowerCase());
    return foundCategory ? foundCategory.icon : <FaMoneyBillWave />;
  };

  const getCategoryColor = (category) => {
    const foundCategory = categories.find(cat => cat.id === category.toLowerCase());
    return foundCategory ? foundCategory.color : '#6B7280';
  };

  const filteredIncomes = selectedCategory === 'all'
    ? incomes
    : incomes.filter(income => income.category.toLowerCase() === selectedCategory);

  if (isLoading) {
    return (
      <div className="income-container">
        <div className="income-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="income-container">
        <div className="income-card">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="income-container">
      <div className="income-header">
        <h1>Income Tracker</h1>
        <p>Track your earnings and financial growth</p>
      </div>

      <div className="income-content">
        <div className="income-sidebar">
          <div className="category-list">
            <h3>Categories</h3>
            <button
              key="all-incomes"
              className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span className="category-icon" style={{ backgroundColor: '#10B981' }}>
                <FaChartPie />
              </span>
              All Income
            </button>
            {categories.map(category => (
              <button
                key={`category-${category.id}`}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon" style={{ backgroundColor: category.color }}>
                  {category.icon}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="income-main">
          <div className="income-actions">
            <button className="add-income-btn" onClick={handleAdd}>
              <FaPlus /> Add New Income
            </button>
          </div>

          <div className="income-list">
            {filteredIncomes.length > 0 ? (
              filteredIncomes.map((income) => (
                <div
                  key={income._id}
                  className="income-card"
                >
                  <div className="income-icon" style={{ backgroundColor: getCategoryColor(income.category) }}>
                    {getCategoryIcon(income.category)}
                  </div>
                  <div className="income-details">
                    <h4>{income.title}</h4>
                    <div className="income-meta">
                      <span className="income-category">{income.category}</span>
                      <span className="income-date">
                        {new Date(income.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="income-amount">
                    {formatCurrency(income.amount)}
                  </div>
                  <div className="income-actions">
                    <button className="action-btn" title="Edit" onClick={() => handleEdit(income)}>
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Delete"
                      onClick={() => handleDelete(income._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-incomes">
                <p>No income found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Income Modal */}
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
          onDelete={() => {
            const incomeToDelete = incomes.find(i => i._id === selectedIncome?._id) || selectedIncome;
            handleDelete(incomeToDelete?._id);
            setShowDeleteModal(false);
          }}
          title="Delete Income"
          message="Are you sure you want to delete this income entry?"
          itemName={selectedIncome?.title}
        />
      )}
    </div>
  );
};

export default Income;
