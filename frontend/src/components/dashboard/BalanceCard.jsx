import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaPlus, FaBullseye, FaArrowUp, FaArrowDown, FaCheckCircle } from 'react-icons/fa';
import './BalanceCard.css';

const BalanceCard = ({ balance = 0, change = 0, onAddExpense }) => {
  const navigate = useNavigate();

  const formatBalance = (val) => {
    const num = Number(val) || 0;
    const [whole, decimal] = Math.abs(num).toFixed(2).split('.');
    return {
      isNegative: num < 0,
      whole: whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      decimal
    };
  };

  const { isNegative, whole, decimal } = formatBalance(balance);
  const isPositiveChange = change >= 0;

  return (
    <div className="balance-card">
      <div className="balance-card__content">
        <div className="balance-card__header">
          <div className="balance-card__title-group">
            <span className="balance-card__label">Total Net Position</span>
            <span className="balance-card__ledger-badge">
              <FaCheckCircle /> Primary Ledger
            </span>
          </div>
          <div className="balance-card__icon">
            <FaWallet />
          </div>
        </div>

        <div className="balance-card__amount">
          <span className="balance-card__currency">{isNegative ? '-₹' : '₹'}</span>
          <span className="balance-card__whole">{whole}</span>
          <span className="balance-card__decimal">.{decimal}</span>
          {change !== 0 && (
            <span className={`balance-card__change ${isPositiveChange ? 'positive' : 'negative'}`}>
              {isPositiveChange ? <FaArrowUp /> : <FaArrowDown />}
              <span>{isPositiveChange ? '+' : ''}{change.toFixed(1)}%</span>
              <span className="balance-card__change-label">vs last month</span>
            </span>
          )}
        </div>

        <div className="balance-card__actions">
          <button className="balance-card__btn balance-card__btn--primary" onClick={onAddExpense}>
            <FaPlus /> Add Expense
          </button>
          <button className="balance-card__btn balance-card__btn--outline" onClick={() => navigate('/goals')}>
            <FaBullseye /> Savings Goals
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
