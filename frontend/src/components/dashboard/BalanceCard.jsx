import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaCopy, FaCheck, FaPlus, FaBullseye } from 'react-icons/fa';
import './BalanceCard.css';

const BalanceCard = ({ balance, change, onAddExpense }) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const accountNumber = '6549 7329 9821 2472';

    const handleCopy = () => {
        navigator.clipboard.writeText(accountNumber.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatBalance = (val) => {
        const num = Number(val) || 0;
        const [whole, decimal] = num.toFixed(2).split('.');
        return { whole: whole.replace(/\B(?=(\d{3})+(?!\d))/g, ','), decimal };
    };

    const { whole, decimal } = formatBalance(balance);

    return (
        <div className="balance-card">
            <div className="balance-card__content">
                <div className="balance-card__header">
                    <span className="balance-card__label">My Balance</span>
                    <div className="balance-card__icon">
                        <FaWallet />
                    </div>
                </div>

                <div className="balance-card__amount">
                    <span className="balance-card__currency">₹</span>
                    <span className="balance-card__whole">{whole}</span>
                    <span className="balance-card__decimal">.{decimal}</span>
                    {change !== 0 && (
                        <span className={`balance-card__change ${change >= 0 ? 'positive' : 'negative'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            <span className="balance-card__change-label">compared to last month</span>
                        </span>
                    )}
                </div>

                <div className="balance-card__account">
                    <span className="balance-card__account-number">{accountNumber}</span>
                    <button className="balance-card__copy" onClick={handleCopy} aria-label="Copy account number">
                        {copied ? <FaCheck /> : <FaCopy />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>

                <div className="balance-card__actions">
                    <button className="balance-card__btn balance-card__btn--primary" onClick={onAddExpense}>
                        <FaPlus /> Add Expense
                    </button>
                    <button className="balance-card__btn balance-card__btn--outline" onClick={() => navigate('/goals')}>
                        <FaBullseye /> Budget Planning
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalanceCard;
