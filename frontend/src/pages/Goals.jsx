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

import api from '../utils/api';
import AddGoalModal from '../components/AddGoalModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

      const response = await api.get('/api/goals');
      setGoals(response.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch goals. Please try again later.');
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
      await api.delete(`/api/goals/${id}`);
      setGoals(prevGoals => prevGoals.filter(goal => goal._id !== id));
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete goal. Please try again later.');
    }
  };

  const handleEdit = (goal) => {
    if (!goal) {
      setError('Invalid goal data');
      return;
    }

    setSelectedGoal(goal);
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedGoal(null);
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
                  <div key={goal._id} className="goal-card">
                    <div className="goal-icon" style={{ backgroundColor: getCategoryColor(goal.category) }}>
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div className="goal-details">
                      <h4>{goal.title}</h4>
                      <span className="goal-category">{goal.category}</span>
                      <div className="goal-progress">
                        <div className="progress-header">
                          <span className="progress-text">{progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: getCategoryColor(goal.category)
                            }}
                          />
                        </div>
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

          {/* Add/Edit Goal Modal */}
          {(showAddModal || showEditModal) && (
            <AddGoalModal
              onClose={() => {
                setShowAddModal(false);
                setShowEditModal(false);
                setSelectedGoal(null);
              }}
              onAddGoal={fetchGoals}
              goal={showEditModal ? selectedGoal : null}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <DeleteConfirmModal
              onClose={() => setShowDeleteModal(false)}
              onDelete={() => {
                handleDelete(selectedGoal?._id);
                setShowDeleteModal(false);
              }}
              title="Delete Goal"
              message="Are you sure you want to delete this financial goal?"
              itemName={selectedGoal?.title}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;
