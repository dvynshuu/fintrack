import React from 'react';
import { FaChartLine, FaPiggyBank, FaLightbulb, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './FinancialScore.css';

const FinancialScore = ({ healthScore, financialHealth, smartSuggestions, insightsLoading, onRefreshInsights }) => {
    const navigate = useNavigate();

    const getScoreStatus = (score) => {
        if (score >= 80) return { label: 'Excellent', class: 'status-excellent', tip: 'You are in the top 5% of savers! Keep it up.' };
        if (score >= 60) return { label: 'Good', class: 'status-good', tip: 'Doing well! A bit more effort on debt reduction could help.' };
        if (score >= 40) return { label: 'Fair', class: 'status-fair', tip: 'You are on the right track, but there is room for growth.' };
        return { label: 'Needs Attention', class: 'status-poor', tip: 'Let\'s focus on building your emergency fund first.' };
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'saving': return <FaPiggyBank />;
            case 'alert': return <FaExclamationTriangle />;
            case 'growth': return <FaChartLine />;
            case 'milestone': return <FaLightbulb />;
            default: return <FaInfoCircle />;
        }
    };

    const status = getScoreStatus(healthScore);

    return (
        <div className="financial-score-container animate-slide-up">
            {/* Existing Score Content */}
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

            {/* AI Insights Section */}
            <div className="suggestions-section">
                <div className="section-header">
                    <div className="header-text">
                        <h3>AI Financial Insights</h3>
                    </div>
                    <button 
                        className={`refresh-insights-btn ${insightsLoading ? 'loading' : ''}`}
                        onClick={onRefreshInsights}
                        disabled={insightsLoading}
                    >
                        <i className="fas fa-sync-alt"></i>
                        {insightsLoading ? ' Analyzing...' : ' Refresh AI'}
                    </button>
                </div>
                
                <div className="suggestions-wrapper">
                    {insightsLoading ? (
                        // Skeleton Loaders
                        [1, 2, 3].map(i => (
                            <div key={i} className="premium-suggestion-card skeleton">
                                <div className="suggestion-icon-container skeleton-bg"></div>
                                <div className="suggestion-details">
                                    <div className="skeleton-line title"></div>
                                    <div className="skeleton-line text"></div>
                                    <div className="skeleton-line text short"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        smartSuggestions.map((suggestion, index) => (
                            <div key={index} className={`premium-suggestion-card card-hover type-${suggestion.type}`}>
                                <div className={`suggestion-icon-container ${suggestion.type}`}>
                                    {getInsightIcon(suggestion.type)}
                                </div>
                                <div className="suggestion-details">
                                    <div className="suggestion-header">
                                        <h4>{suggestion.title}</h4>
                                        {suggestion.impact && <span className={`impact-badge ${suggestion.impact}`}>{suggestion.impact} Impact</span>}
                                    </div>
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
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialScore;
