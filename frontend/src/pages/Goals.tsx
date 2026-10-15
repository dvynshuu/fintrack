import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AddGoalModal from '../components/AddGoalModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { Goal } from '../types';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBullseye,
  FaPiggyBank,
  FaCheckCircle,
  FaCalendarAlt,
  FaCoins,
  FaArrowDown,
  FaHome,
  FaCar,
  FaGraduationCap,
  FaPlane,
  FaHeart,
  FaShieldAlt,
  FaChartLine
} from 'react-icons/fa';
import './Goals.css';

const Goals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<Goal[]>('/api/goals');
      setGoals(response.data);
    } catch (err: unknown) {
      console.error('Error fetching goals:', err);
      const errorMsg = (err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ||
        (err as Error).message ||
        'Failed to fetch financial goals.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchGoals();
    }
  }, [user, fetchGoals]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      setError(null);
      await api.delete(`/api/goals/${id}`);
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal.');
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount || Number(depositAmount) <= 0) return;

    try {
      setIsDepositing(true);
      const newCurrentAmount = Number(depositGoal.currentAmount || 0) + Number(depositAmount);
      const goalId = depositGoal._id || depositGoal.id;
      const updatedGoal = {
        ...depositGoal,
        currentAmount: newCurrentAmount,
        status: newCurrentAmount >= depositGoal.targetAmount ? 'Completed' : 'In Progress'
      };

      await api.put(`/api/goals/${goalId}`, updatedGoal);
      setGoals((prev) =>
        prev.map((g) => ((g._id || g.id) === goalId ? { ...g, currentAmount: newCurrentAmount } : g))
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const calculateProgress = (current: number, target: number) => {
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

  const getGoalIcon = (goal: Goal) => {
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
          <h1>Savings Goals</h1>
          <p>Track what you're saving for, celebrate milestones, and reach your goals faster</p>
        </div>
        <button className="add-goal-btn" onClick={() => { setSelectedGoal(null); setShowAddModal(true); }}>
          <FaPlus /> New Goal
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Portfolio Progress Strip */}
      <div className="goals-metrics-strip">
        <div className="goals-metric-card">
          <div className="goals-metric-header">
            <span className="goals-metric-label">Total Saved</span>
            <FaPiggyBank className="goals-metric-icon" />
          </div>
          <div className="goals-metric-value">{formatCurrency(portfolioMetrics.totalCurrent)}</div>
          <span className="goals-metric-sub">Across your active goals</span>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-header">
            <span className="goals-metric-label">Total Goal Target</span>
            <FaBullseye className="goals-metric-icon" />
          </div>
          <div className="goals-metric-value">{formatCurrency(portfolioMetrics.totalTarget)}</div>
          <span className="goals-metric-sub">Needed for all {portfolioMetrics.totalCount} goals</span>
        </div>

        <div className="goals-metric-card">
          <div className="goals-metric-header">
            <span className="goals-metric-label">Overall Progress</span>
            <FaCoins className="goals-metric-icon" />
          </div>
          <div className="goals-metric-value">{portfolioMetrics.overallPct}%</div>
          <span className="goals-metric-sub">{portfolioMetrics.completedCount} of {portfolioMetrics.totalCount} goals completed</span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {isLoading ? (
          <div className="goals-empty-state">
            <p>Loading goals...</p>
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const remaining = Math.max(0, (Number(goal.targetAmount) || 0) - (Number(goal.currentAmount) || 0));

            // Calculate projection days
            let projectionText: string | null = null;
            if (goal.targetDate || goal.deadline) {
              const targetDate = new Date(goal.targetDate || goal.deadline || '');
              const diffTime = targetDate.getTime() - new Date().getTime();
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
            const goalKey = goal._id || goal.id;

            return (
              <div key={goalKey} className={`goal-card ${isAchieved ? 'is-completed' : ''}`}>
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
                      title="Edit Goal"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="goal-action-btn delete"
                      title="Delete Goal"
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
                        <FaCheckCircle /> Goal Reached!
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
                    <FaCoins /> Add Money
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="goals-empty-state">
            <FaBullseye className="empty-icon" />
            <h3>No savings goals yet</h3>
            <p>Set a goal to save for a home, vacation, emergency fund, or dream purchase!</p>
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
              <h2>Add Money to "{depositGoal.title}"</h2>
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
                  <label htmlFor="depositAmount">Amount to Add (₹)</label>
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
                  {isDepositing ? 'Adding...' : 'Add to Goal'}
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
          onDelete={() => handleDelete(selectedGoal._id || selectedGoal.id)}
          title="Delete Goal"
          message="Are you sure you want to delete this goal?"
          itemName={selectedGoal.title}
        />
      )}
    </div>
  );
};

export default Goals;
