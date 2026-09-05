import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AddGoalModal from '../components/AddGoalModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBullseye,
  FaPiggyBank,
  FaCheckCircle,
  FaCalendarAlt,
  FaCoins,
  FaArrowRight,
  FaArrowDown,
  FaHome,
  FaCar,
  FaGraduationCap,
  FaPlane,
  FaHeart,
  FaGift,
  FaShieldAlt,
  FaChartLine
} from 'react-icons/fa';
import './Goals.css';

const CATEGORIES = [
  { id: 'house', name: 'Real Estate & Housing', icon: <FaHome />, color: '#10B981' },
  { id: 'car', name: 'Vehicle & Transport', icon: <FaCar />, color: '#38BDF8' },
  { id: 'education', name: 'Education & Tuition', icon: <FaGraduationCap />, color: '#F59E0B' },
  { id: 'travel', name: 'Travel & Expedition', icon: <FaPlane />, color: '#EC4899' },
  { id: 'wedding', name: 'Life Milestones', icon: <FaHeart />, color: '#6366F1' },
  { id: 'other', name: 'Capital Reserves', icon: <FaGift />, color: '#64748B' }
];

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
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

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
      setError(err.response?.data?.message || err.message || 'Failed to fetch financial goals.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      setError(null);
      await api.delete(`/api/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g._id !== id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal.');
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount || Number(depositAmount) <= 0) return;

    try {
      setIsDepositing(true);
      const newCurrentAmount = Number(depositGoal.currentAmount || 0) + Number(depositAmount);
      const updatedGoal = {
        ...depositGoal,
        currentAmount: newCurrentAmount,
        status: newCurrentAmount >= depositGoal.targetAmount ? 'Completed' : 'In Progress'
      };

      await api.put(`/api/goals/${depositGoal._id}`, updatedGoal);
      setGoals((prev) =>
        prev.map((g) => (g._id === depositGoal._id ? { ...g, currentAmount: newCurrentAmount } : g))
      );
      setDepositGoal(null);
      setDepositAmount('');
    } catch (err) {
      console.error('Error contributing to goal:', err);
      alert('Failed to record contribution.');
    } finally {
      setIsDepositing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateProgress = (current, target) => {
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((Number(current || 0) / Number(target)) * 100), 100);
  };

  // Overall Portfolio Goals Metrics
  const portfolioMetrics = useMemo(() => {
    const totalCurrent = goals.reduce((s, g) => s + (Number(g.currentAmount) || 0), 0);
    const totalTarget = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
    const overallPct = totalTarget > 0 ? Math.min(Math.round((totalCurrent / totalTarget) * 100), 100) : 0;
    const completedCount = goals.filter((g) => (g.currentAmount || 0) >= (g.targetAmount || 0)).length;

    return { totalCurrent, totalTarget, overallPct, completedCount, totalCount: goals.length };
  }, [goals]);

  const filteredGoals = useMemo(() => {
    if (selectedCategory === 'all') return goals;
    return goals.filter((g) => (g.category || '').toLowerCase() === selectedCategory.toLowerCase());
  }, [goals, selectedCategory]);

  const getGoalIcon = (goal) => {
    const text = `${goal.type || ''} ${goal.category || ''} ${goal.title || ''}`.toLowerCase();
    if (text.includes('house') || text.includes('home') || text.includes('estate') || text.includes('mortgage')) return <FaHome />;
    if (text.includes('car') || text.includes('vehicle') || text.includes('transport')) return <FaCar />;
    if (text.includes('education') || text.includes('tuition') || text.includes('college')) return <FaGraduationCap />;
    if (text.includes('travel') || text.includes('trip') || text.includes('vacation')) return <FaPlane />;
    if (text.includes('wedding') || text.includes('ring') || text.includes('life')) return <FaHeart />;
    if (text.includes('emergency')) return <FaShieldAlt />;
    if (text.includes('invest')) return <FaChartLine />;
    if (text.includes('debt')) return <FaArrowDown />;
    return <FaBullseye />;
  };

  return (
    <div className="goals-container">
      {/* Header */}
      <div className="goals-header">
        <div>
          <h1>Capital Targets & Goals</h1>
          <p>Multi-horizon savings trajectories, capital accumulation, and target milestones</p>
        </div>
        <button className="add-goal-btn" onClick={() => { setSelectedGoal(null); setShowAddModal(true); }}>
          <FaPlus /> Define New Target
        </button>
      </div>

      {/* Portfolio Progress Strip */}
      <div className="goals-metrics-strip">
        <div className="goals-metric-card">
          <div className="goals-metric-header">
            <span className="goals-metric-label">Accumulated Capital</span>
            <FaPiggyBank className="goals-metric-icon" />
          </div>
          <div className="goals-metric-value">{formatCurrency(portfolioMetrics.totalCurrent)}</div>
          <span className="goals-metric-sub">Dedicated to targets</span>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-header">
            <span className="goals-metric-label">Target Capital Pool</span>
            <FaBullseye className="goals-metric-icon" />
          </div>
          <div className="goals-metric-value">{formatCurrency(portfolioMetrics.totalTarget)}</div>
          <span className="goals-metric-sub">Across {portfolioMetrics.totalCount} strategic goals</span>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-header">
            <span className="goals-metric-label">Portfolio Completion</span>
            <FaCoins className="goals-metric-icon" />
          </div>
          <div className="goals-metric-value">{portfolioMetrics.overallPct}%</div>
          <span className="goals-metric-sub">{portfolioMetrics.completedCount} targets achieved</span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const remaining = Math.max(0, (Number(goal.targetAmount) || 0) - (Number(goal.currentAmount) || 0));

            // Calculate projection days
            let projectionText = null;
            if (goal.targetDate || goal.deadline) {
              const targetDate = new Date(goal.targetDate || goal.deadline);
              const diffTime = targetDate - new Date();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 0) {
                const months = Math.max(1, Math.round(diffDays / 30));
                const requiredPerMonth = remaining / months;
                projectionText = `${diffDays} days left (~${formatCurrency(requiredPerMonth)}/mo)`;
              } else {
                projectionText = 'Target deadline reached';
              }
            }

            const isAchieved = progress >= 100;

            return (
              <div key={goal._id} className={`goal-card ${isAchieved ? 'is-completed' : ''}`}>
                <div className="goal-card-top">
                  <div className="goal-card-info">
                    <span className="goal-type-badge">
                      <span className="goal-type-icon">{getGoalIcon(goal)}</span>
                      {goal.type || goal.category || 'Savings Target'}
                    </span>
                    <h3 className="goal-title">{goal.title}</h3>
                  </div>
                  <div className="goal-actions">
                    <button
                      className="goal-action-btn edit"
                      title="Edit Target"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="goal-action-btn delete"
                      title="Delete Target"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Milestone */}
                <div className="goal-progress-section">
                  <div className="goal-progress-meta">
                    <span className="progress-percentage-label">{progress}% Funded</span>
                    {isAchieved ? (
                      <span className="milestone-badge achieved">
                        <FaCheckCircle /> Goal Reached
                      </span>
                    ) : (
                      <span className="milestone-badge in-progress">
                        {formatCurrency(remaining)} remaining
                      </span>
                    )}
                  </div>

                  <div className="goal-progress-track">
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Values Grid */}
                <div className="goal-amounts-grid">
                  <div className="amount-col">
                    <span className="amount-label">Saved</span>
                    <span className="amount-val current">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="amount-col target-col">
                    <span className="amount-label">Target</span>
                    <span className="amount-val target">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Projection / Timeline */}
                {projectionText && (
                  <div className="goal-projection-strip">
                    <FaCalendarAlt className="projection-icon" />
                    <span>{projectionText}</span>
                  </div>
                )}

                {/* Deposit / Contribution Action */}
                <div className="goal-card-footer">
                  <button
                    className="btn-contribute"
                    onClick={() => setDepositGoal(goal)}
                  >
                    <FaCoins /> Record Contribution
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="goals-empty-state">
            <FaBullseye className="empty-icon" />
            <h3>No Financial Goals Defined</h3>
            <p>Define a new target to establish multi-month savings velocity and progress tracking.</p>
            <button
              className="btn-create-first"
              onClick={() => {
                setSelectedGoal(null);
                setShowAddModal(true);
              }}
            >
              <FaPlus /> Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Quick Deposit / Contribution Modal */}
      {depositGoal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Deposit to "{depositGoal.title}"</h2>
              <button className="close-btn" onClick={() => setDepositGoal(null)}>
                ×
              </button>
            </div>
            <form onSubmit={handleDepositSubmit}>
              <div className="modal-body">
                <p className="deposit-summary-text">
                  Currently saved: <strong>{formatCurrency(depositGoal.currentAmount)}</strong> of{' '}
                  <strong>{formatCurrency(depositGoal.targetAmount)}</strong>
                </p>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label htmlFor="depositAmount">Contribution Amount (₹)</label>
                  <input
                    type="number"
                    id="depositAmount"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="1"
                    step="0.01"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDepositGoal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isDepositing || !depositAmount}
                >
                  {isDepositing ? 'Recording...' : 'Confirm Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Goal Modal */}
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
      {showDeleteModal && selectedGoal && (
        <DeleteConfirmModal
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedGoal(null);
          }}
          onDelete={() => handleDelete(selectedGoal._id)}
          title="Delete Financial Goal"
          message="Are you sure you want to permanently delete this goal?"
          itemName={selectedGoal.title}
        />
      )}
    </div>
  );
};

export default Goals;
