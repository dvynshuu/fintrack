import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaCar, FaUtensils, FaHome, FaGamepad, FaEllipsisH } from 'react-icons/fa';
import './TransactionTable.css';

const CATEGORY_ICONS = {
    food: FaUtensils,
    transport: FaCar,
    shopping: FaShoppingCart,
    housing: FaHome,
    entertainment: FaGamepad,
};

const getCategoryIcon = (category) => {
    const key = (category || '').toLowerCase();
    for (const [name, Icon] of Object.entries(CATEGORY_ICONS)) {
        if (key.includes(name)) return Icon;
    }
    return FaEllipsisH;
};

const TransactionTable = ({ expenses = [] }) => {
    const navigate = useNavigate();

    const recent = [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (recent.length === 0) {
        return (
            <div className="txn-table__empty">
                <p>No recent transactions to show.</p>
            </div>
        );
    }

    return (
        <div className="txn-table">
            <div className="txn-table__list">
                {recent.map((expense, i) => {
                    const Icon = getCategoryIcon(expense.category);
                    return (
                        <div
                            key={expense._id || i}
                            className="txn-table__row"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="txn-table__icon">
                                <Icon />
                            </div>
                            <div className="txn-table__info">
                                <span className="txn-table__title">
                                    {expense.description || expense.title || 'Expense'}
                                </span>
                                <span className="txn-table__category">{expense.category || 'Other'}</span>
                            </div>
                            <div className="txn-table__date">{formatDate(expense.date)}</div>
                            <div className="txn-table__amount">
                                -₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="txn-table__view-all" onClick={() => navigate('/expenses')}>
                View all transactions →
            </button>
        </div>
    );
};

export default TransactionTable;
