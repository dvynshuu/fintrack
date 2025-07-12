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

const Income = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

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
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/incomes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch incomes');
      }

      const data = await response.json();
      setIncomes(data);
    } catch (err) {
      console.error('Error fetching incomes:', err);
      setError(err.message || 'Failed to fetch incomes. Please try again later.');
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/incomes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete income');
      }

      setIncomes(prevIncomes => prevIncomes.filter(income => income._id !== id));
    } catch (err) {
      console.error('Error deleting income:', err);
      setError(err.message || 'Failed to delete income. Please try again later.');
    }
  };

  const handleEdit = (income) => {
    if (!income) {
      setError('Invalid income data');
      return;
    }

    setSelectedIncome(income);
    setFormData({
      description: income.title || income.description || '',
      amount: income.amount ? income.amount.toString() : '',
      category: income.category || '',
      date: income.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const incomeData = {
        title: formData.description,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      };

      let url;
      let method;

      if (showEditModal && selectedIncome && selectedIncome._id) {
        url = `http://localhost:5001/api/incomes/${selectedIncome._id}`;
        method = 'PUT';
      } else {
        url = 'http://localhost:5001/api/incomes';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incomeData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save income');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedIncome(null);
      await fetchIncomes();
    } catch (err) {
      console.error('Error saving income:', err);
      setError(err.message || 'Failed to save income. Please try again later.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                    <h4>{income.description}</h4>
                    <span className="income-category">{income.category}</span>
                    <span className="income-date">
                      {new Date(income.date).toLocaleDateString()}
                    </span>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{showEditModal ? 'Edit Income' : 'Add New Income'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={`option-${category.id}`} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedIncome(null);
                }}>
                  Cancel
                </button>
                <button type="submit">
                  {showEditModal ? 'Save Changes' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
