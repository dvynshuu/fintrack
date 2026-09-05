import React from 'react';
import { ShieldCheck, CheckCircle, Info, X } from 'lucide-react';
import './HealthScoreModal.css';

const HealthScoreModal = ({ isOpen, onClose, healthData }) => {
  if (!isOpen || !healthData) return null;

  const { healthScore, status, dimensions = [], summary } = healthData;

  return (
    <div className="health-modal-backdrop" onClick={onClose}>
      <div className="health-modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="health-modal-header">
          <div className="health-modal-title-group">
            <ShieldCheck size={24} className="health-modal-icon" />
            <div>
              <h3>How Your Financial Health Score Works</h3>
              <p className="subtitle">A clear breakdown of your savings, emergency cushion, debts, and spending habits</p>
            </div>
          </div>
          <button className="health-modal-close" onClick={onClose} aria-label="Close health modal">
            <X size={18} />
          </button>
        </div>

        <div className="health-modal-score-banner">
          <div className="banner-score">
            <span className="score-num">{healthScore}</span>
            <span className="score-denom">/ 100</span>
          </div>
          <div className="banner-details">
            <div className="banner-status-tag">
              {healthScore >= 80 ? 'Strong Shape' : healthScore >= 60 ? 'Good Shape' : healthScore >= 40 ? 'Fair Shape' : 'Needs Attention'}
            </div>
            <p>Calculated directly from your actual bank accounts, savings rate, and spending patterns.</p>
          </div>
        </div>

        <div className="health-dimensions-list">
          <h4>Your 7 Financial Health Factors</h4>
          {dimensions.map((dim, idx) => (
            <div key={idx} className="health-dim-item">
              <div className="dim-header">
                <span className="dim-name">{dim.name}</span>
                <span className="dim-weight">Impact: {Math.round(dim.weight * 100)}%</span>
                <span className="dim-score tabular-num">
                  {dim.score} / 100 ({dim.weightedScore.toFixed(1)} pts)
                </span>
              </div>

              <div className="dim-progress-bg">
                <div
                  className="dim-progress-fill"
                  style={{ width: `${Math.min(100, dim.score)}%` }}
                />
              </div>

              <div className="dim-evidence">
                <div className="evidence-calc">
                  <strong>How it's measured:</strong> {dim.calculation}
                </div>
                <div className="evidence-text">
                  <Info size={12} /> {dim.evidence}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="health-modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreModal;
