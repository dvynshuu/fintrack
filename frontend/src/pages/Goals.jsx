import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaHome,
  FaCar,
  FaGraduationCap,
  FaPlane,
  FaHeart,
  FaGift,
  FaChartLine,
  FaPiggyBank,
  FaWallet,
  FaCreditCard,
  FaUniversity,
  FaChartPie
} from 'react-icons/fa';
import './Goals.css';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    category: '',
    deadline: '',
    description: ''
  });

  const categories = [
    { id: 'house', name: 'House', icon: <FaHome />, color: '#10B981' },
    { id: 'car', name: 'Car', icon: <FaCar />, color: '#3B82F6' },
    { id: 'education', name: 'Education', icon: <FaGraduationCap />, color: '#8B5CF6' },
    { id: 'travel', name: 'Travel', icon: <FaPlane />, color: '#EC4899' },
    { id: 'wedding', name: 'Wedding', icon: <FaHeart />, color: '#F59E0B' },
    { id: 'other', name: 'Other', icon: <FaGift />, color: '#6B7280' }
  ];

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/goals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to fetch goals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError('Invalid goal ID');
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5001/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete goal');
      }

      setGoals(prevGoals => prevGoals.filter(goal => goal._id !== id));
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err.message || 'Failed to delete goal. Please try again later.');
    }
  };

  const handleEdit = (goal) => {
    if (!goal) {
      setError('Invalid goal data');
      return;
    }

    setSelectedGoal(goal);
    setFormData({
      title: goal.title || '',
      targetAmount: goal.targetAmount ? goal.targetAmount.toString() : '',
      currentAmount: goal.currentAmount ? goal.currentAmount.toString() : '',
      category: goal.category || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      description: goal.description || ''
    });
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: '',
      category: '',
      deadline: '',
      description: ''
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

      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount)
      };

      let url;
      let method;

      if (showEditModal && selectedGoal && selectedGoal._id) {
        url = `http://localhost:5001/api/goals/${selectedGoal._id}`;
        method = 'PUT';
      } else {
        url = 'http://localhost:5001/api/goals';
        method = 'POST';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save goal');
      }

      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedGoal(null);
      await fetchGoals();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError(err.message || 'Failed to save goal. Please try again later.');
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
    return foundCategory ? foundCategory.icon : <FaChartPie />;
  };

  const getCategoryColor = (category) => {
    const foundCategory = categories.find(cat => cat.id === category.toLowerCase());
    return foundCategory ? foundCategory.color : '#6B7280';
  };

  const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category.toLowerCase() === selectedCategory);

  if (isLoading) {
    return (
      <div className="goals-container">
        <div className="goals-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="goals-container">
        <div className="goals-card">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h1>Financial Goals</h1>
        <p>Track your savings and achieve your dreams</p>
      </div>

      <div className="goals-content">
        <div className="goals-sidebar">
          <div className="category-list">
            <h3>Categories</h3>
            <button 
              key="all-goals"
              className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <span className="category-icon" style={{ backgroundColor: '#10B981' }}>
                <FaChartPie />
              </span>
              All Goals
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

        <div className="goals-main">
          <div className="goals-actions">
            <button className="add-goal-btn" onClick={handleAdd}>
              <FaPlus /> Add New Goal
            </button>
          </div>

          <div className="goals-list">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal) => {
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                return (
                  <div 
                    key={goal._id} 
                    className="goal-card"
                  >
                    <div className="goal-icon" style={{ backgroundColor: getCategoryColor(goal.category) }}>
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div className="goal-details">
                      <h4>{goal.title}</h4>
                      <span className="goal-category">{goal.category}</span>
                      <div className="goal-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: getCategoryColor(goal.category)
                            }}
                          />
                        </div>
                        <span className="progress-text">{progress}%</span>
                      </div>
                      <div className="goal-amounts">
                        <span className="current-amount">
                          Saved: {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="target-amount">
                          Target: {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      {goal.deadline && (
                        <span className="goal-deadline">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="goal-actions">
                      <button className="action-btn" title="Edit" onClick={() => handleEdit(goal)}>
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete" 
                        title="Delete"
                        onClick={() => handleDelete(goal._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-goals">
                <p>No goals found in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{showEditModal ? 'Edit Goal' : 'Add New Goal'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={formData.targetAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Current Amount</label>
                <input
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
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
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedGoal(null);
                }}>
                  Cancel
                </button>
                <button type="submit">
                  {showEditModal ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
