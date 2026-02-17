import React from 'react';
import { FaChartLine, FaPiggyBank, FaLightbulb, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './FinancialScore.css';

const FinancialScore = ({ healthScore, financialHealth, smartSuggestions }) => {
    const navigate = useNavigate();

    const getScoreStatus = (score) => {
        if (score >= 80) return { label: 'Excellent', class: 'status-excellent', tip: 'You are in the top 5% of savers! Keep it up.' };
        if (score >= 60) return { label: 'Good', class: 'status-good', tip: 'Doing well! A bit more effort on debt reduction could help.' };
        if (score >= 40) return { label: 'Fair', class: 'status-fair', tip: 'You are on the right track, but there is room for growth.' };
        return { label: 'Needs Attention', class: 'status-poor', tip: 'Let\'s focus on building your emergency fund first.' };
    };

    const status = getScoreStatus(healthScore);

    return (
        <div className="financial-score-container animate-slide-up">
            <div className="score-main-card">
                <div className="score-header">
                    <div className="header-text">
                        <h2>Financial Health Score</h2>
                        <p className="subtitle">Real-time analysis of your fiscal resilience</p>
                    </div>
                    <div className={`status-badge ${status.class}`}>
                        {status.label}
                    </div>
                </div>

                <div className="score-content">
                    <div className="score-visual">
                        <div className="gauge-container">
                            <svg viewBox="0 0 100 100" className="score-gauge">
                                <circle className="gauge-bg" cx="50" cy="50" r="45" />
                                <circle
                                    className={`gauge-progress ${status.class}`}
                                    cx="50" cy="50" r="45"
                                    style={{
                                        strokeDasharray: `${healthScore * 2.82} 282.6`
                                    }}
                                />
                            </svg>
                            <div className="score-display">
                                <span className="score-number">{healthScore}</span>
                                <span className="score-label">/ 100</span>
                            </div>
                        </div>
                        <div className="score-insight">
                            <FaInfoCircle className="insight-icon" />
                            <p>{status.tip}</p>
                        </div>
                    </div>

                    <div className="metrics-grid">
                        <div className="metric-item card-hover" title="Percentage of income saved monthly">
                            <div className="metric-top">
                                <div className="metric-icon-box success">
                                    <FaPiggyBank />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-name">Savings Velocity</span>
                                    <span className="metric-percent">{financialHealth.savingsRate}%</span>
                                </div>
                            </div>
                            <div className="metric-progress-wrapper">
                                <div className="metric-progress-bg">
                                    <div
                                        className="metric-progress-fill success"
                                        style={{ width: `${Math.min(financialHealth.savingsRate, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="metric-item card-hover" title="Availability of liquid funds for emergencies">
                            <div className="metric-top">
                                <div className="metric-icon-box warning">
                                    <FaExclamationTriangle />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-name">Safety Net</span>
                                    <span className="metric-percent">{financialHealth.emergencyFund}%</span>
                                </div>
                            </div>
                            <div className="metric-progress-wrapper">
                                <div className="metric-progress-bg">
                                    <div
                                        className="metric-progress-fill warning"
                                        style={{ width: `${Math.min(financialHealth.emergencyFund, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="metric-item card-hover" title="Growth rate of your investments and assets">
                            <div className="metric-top">
                                <div className="metric-icon-box primary">
                                    <FaChartLine />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-name">Asset Growth</span>
                                    <span className="metric-percent">{financialHealth.investmentGrowth}%</span>
                                </div>
                            </div>
                            <div className="metric-progress-wrapper">
                                <div className="metric-progress-bg">
                                    <div
                                        className="metric-progress-fill primary"
                                        style={{ width: `${Math.min(financialHealth.investmentGrowth, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="suggestions-section">
                <div className="section-header">
                    <h3>Strategic Insights</h3>
                    <p>Personalized recommendations to boost your score</p>
                </div>
                <div className="suggestions-wrapper">
                    {smartSuggestions.map((suggestion, index) => (
                        <div key={index} className="premium-suggestion-card card-hover">
                            <div className="suggestion-icon-container">
                                <FaLightbulb />
                            </div>
                            <div className="suggestion-details">
                                <h4>{suggestion.title}</h4>
                                <p>{suggestion.description}</p>
                                {suggestion.action && (
                                    <button
                                        className="btn-text-action"
                                        onClick={() => navigate(suggestion.action.link)}
                                    >
                                        {suggestion.action.text} →
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FinancialScore;
