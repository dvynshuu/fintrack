import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './MetricCard.css';

const MetricCard = ({ title, amount, change, type = 'income', icon, delay = 0 }) => {
    const isPositive = change >= 0;
    const formattedAmount = Number(amount || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <div
            className={`metric-card metric-card--${type}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="metric-card__icon-box">
                {icon}
            </div>
            <div className="metric-card__label">{title}</div>
            <div className="metric-card__value">
                <span className="metric-card__currency">₹</span>
                {formattedAmount}
            </div>
            <div className={`metric-card__change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
                <span className="metric-card__change-label">compared to last month</span>
            </div>
        </div>
    );
};

export default MetricCard;
