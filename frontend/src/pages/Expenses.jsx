import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUtensils,
  FaHome,
  FaCar,
  FaShoppingBag,
  FaHeartbeat,
  FaGamepad,
  FaGraduationCap,
  FaChartPie,
  FaPlane,
  FaGift
} from 'react-icons/fa';
import './Expenses.css';
import { useExpenses } from '../contexts/ExpenseContext';
import AddExpenseModal from '../components/AddExpenseModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const Expenses = () => {
  const { user } = useAuth();
  const { expenses, loading, error, fetchExpenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'food', name: 'Food & Dining', icon: <FaUtensils />, color: '#FF6B6B' },
    { id: 'housing', name: 'Housing', icon: <FaHome />, color: '#4ECDC4' },
    { id: 'transportation', name: 'Transportation', icon: <FaCar />, color: '#45B7D1' },
    { id: 'shopping', name: 'Shopping', icon: <FaShoppingBag />, color: '#96CEB4' },
    { id: 'healthcare', name: 'Healthcare', icon: <FaHeartbeat />, color: '#FF9999' },
    { id: 'entertainment', name: 'Entertainment', icon: <FaGamepad />, color: '#9B59B6' },
    { id: 'education', name: 'Education', icon: <FaGraduationCap />, color: '#3498DB' },
    { id: 'travel', name: 'Travel', icon: <FaPlane />, color: '#E67E22' },
    { id: 'gifts', name: 'Gifts', icon: <FaGift />, color: '#E74C3C' }
  ];

  const handleDelete = async (id) => {
    if (!id) {
      console.error('Invalid expense ID');
      return;
    }

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
    if (!expense) {
      console.error('Invalid expense data');
      return;
    }

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
      currency: 'INR'
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const foundCategory = categories.find(cat => cat.id === category.toLowerCase());
    return foundCategory ? foundCategory.icon : <FaShoppingBag />;
  };

  const getCategoryColor = (category) => {
    const foundCategory = categories.find(cat => cat.id === category.toLowerCase());
    return foundCategory ? foundCategory.color : '#95A5A6';
  };

  const filteredExpenses = selectedCategory === 'all'
    ? expenses
    : expenses.filter(expense => expense.category.toLowerCase() === selectedCategory);

  if (loading) {
    return (
      <div className="expenses-container">
        <div className="expenses-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expenses-container">
        <div className="expenses-card">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h1>Expense Tracker</h1>
        <p>Manage your spending habits</p>
      </div>

      <div className="expenses-content">
        <div className="expenses-sidebar">
          <div className="category-list">
            <h3>Categories</h3>
            <button
              key="all-expenses"
              className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span className="category-icon" style={{ backgroundColor: '#3498db' }}>
                <FaChartPie />
              </span>
              All Expenses
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

        <div className="expenses-main">
          <div className="expenses-actions">
            <button className="add-expense-btn" onClick={handleAdd}>
              <FaPlus /> Add New Expense
            </button>
          </div>

          <div className="expenses-list">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="expense-card"
                >
                  <div className="expense-icon" style={{ backgroundColor: getCategoryColor(expense.category) }}>
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="expense-details">
                    <h4>{expense.description}</h4>
                    <div className="expense-meta">
                      <span className="expense-category">{expense.category}</span>
                      <span className="expense-date">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="expense-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className="expense-actions">
                    <button
                      className="action-btn edit"
                      title="Edit"
                      onClick={() => handleEdit(expense)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      title="Delete"
                      onClick={() => confirmDelete(expense)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-expenses">
                <p>No expenses found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
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
          message="Are you sure you want to delete this expense?"
          itemName={expenseToDelete.description || expenseToDelete.title}
        />
      )}
    </div>
  );
};

export default Expenses;