import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Search,
  PlusCircle,
  ArrowRightLeft,
  Upload,
  PieChart,
  Target,
  Settings as SettingsIcon,
  User,
  Sun,
  Moon,
  DollarSign,
  TrendingUp,
  X
} from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = ({
  isOpen,
  onClose,
  onOpenTransfer,
  onOpenAddTransaction,
  onOpenSubscriptions,
  onOpenScenarioLab,
  onOpenWhatChanged,
  onOpenNetWorth,
  onOpenAskFinTrack
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const actions = [
    {
      id: 'ask-fintrack',
      title: 'Ask FinTrack Assistant',
      subtitle: 'Ask questions about your money, spending, or savings in plain English',
      icon: <TrendingUp size={16} />,
      handler: () => {
        onClose();
        if (onOpenAskFinTrack) onOpenAskFinTrack();
      }
    },
    {
      id: 'what-changed',
      title: 'This Month vs Last Month',
      subtitle: 'See how your spending and income shifted compared to last month',
      icon: <PieChart size={16} />,
      handler: () => {
        onClose();
        if (onOpenWhatChanged) onOpenWhatChanged();
      }
    },
    {
      id: 'scenario-lab',
      title: 'What-If Planner',
      subtitle: 'See how saving a little more or cutting back helps you reach your goals faster',
      icon: <Target size={16} />,
      handler: () => {
        onClose();
        if (onOpenScenarioLab) onOpenScenarioLab();
      }
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions & Regular Bills',
      subtitle: 'Track your streaming services, monthly memberships, and regular bills',
      icon: <DollarSign size={16} />,
      handler: () => {
        onClose();
        if (onOpenSubscriptions) onOpenSubscriptions();
      }
    },
    {
      id: 'net-worth-waterfall',
      title: 'Net Worth Breakdown',
      subtitle: 'See how your starting money plus income minus expenses equals your net worth',
      icon: <TrendingUp size={16} />,
      handler: () => {
        onClose();
        if (onOpenNetWorth) onOpenNetWorth();
      }
    },
    {
      id: 'add-tx',
      title: 'Add Expense or Income',
      subtitle: 'Record a new expense, purchase, or income deposit',
      icon: <PlusCircle size={16} />,
      handler: () => {
        onClose();
        if (onOpenAddTransaction) onOpenAddTransaction();
        else navigate('/expenses');
      }
    },
    {
      id: 'transfer',
      title: 'Transfer Money',
      subtitle: 'Move money between your bank accounts or pay off a credit card',
      icon: <ArrowRightLeft size={16} />,
      handler: () => {
        onClose();
        if (onOpenTransfer) onOpenTransfer();
        else navigate('/expenses');
      }
    },
    {
      id: 'import-statement',
      title: 'Upload Bank Statement (CSV)',
      subtitle: 'Import transactions from your bank file with automatic duplicate check',
      icon: <Upload size={16} />,
      handler: () => {
        onClose();
        navigate('/expenses?action=import');
      }
    },
    {
      id: 'nav-dashboard',
      title: 'Dashboard Overview',
      subtitle: 'View your net worth, safe-to-spend balance, and financial cushion',
      icon: <TrendingUp size={16} />,
      handler: () => {
        onClose();
        navigate('/');
      }
    },
    {
      id: 'nav-expenses',
      title: 'Expenses History',
      subtitle: 'Browse, filter, and review all your past expenses and purchases',
      icon: <DollarSign size={16} />,
      handler: () => {
        onClose();
        navigate('/expenses');
      }
    },
    {
      id: 'nav-goals',
      title: 'Savings Goals',
      subtitle: 'Track your progress towards an emergency fund, vacation, or big purchase',
      icon: <Target size={16} />,
      handler: () => {
        onClose();
        navigate('/goals');
      }
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${theme === 'dark' ? 'Paper Light' : 'Obsidian Dark'} Mode`,
      subtitle: 'Adjust terminal contrast and surface tokens',
      icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
      handler: () => {
        toggleTheme(theme === 'dark' ? 'light' : 'dark');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      title: 'Settings & Security',
      subtitle: 'Manage currency formatting, notifications, and security',
      icon: <SettingsIcon size={16} />,
      handler: () => {
        onClose();
        navigate('/settings');
      }
    },
    {
      id: 'nav-profile',
      title: 'Account Profile',
      subtitle: 'View your identity and regional preferences',
      icon: <User size={16} />,
      handler: () => {
        onClose();
        navigate('/profile');
      }
    }
  ];

  const filtered = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].handler();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="command-palette-header">
          <Search size={18} className="command-palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command, search accounts, or jump to ledger..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button className="command-palette-close" onClick={onClose} aria-label="Close command palette">
            <X size={16} />
          </button>
        </div>

        <div className="command-palette-results">
          {filtered.length === 0 ? (
            <div className="command-palette-empty">No matching actions or commands found.</div>
          ) : (
            filtered.map((action, index) => (
              <div
                key={action.id}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={action.handler}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="command-palette-item-icon">{action.icon}</div>
                <div className="command-palette-item-content">
                  <span className="command-palette-item-title">{action.title}</span>
                  <span className="command-palette-item-subtitle">{action.subtitle}</span>
                </div>
                <span className="command-palette-item-badge">↵</span>
              </div>
            ))
          )}
        </div>

        <div className="command-palette-footer">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Execute with <kbd>Enter</kbd></span>
          <span>Close with <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
