import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';
import {
  FaHome,
  FaChartPie,
  FaMoneyBillWave,
  FaBullseye,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaBell,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronDown,
  FaBars,
  FaTimes
} from 'react-icons/fa';

import Logo from './Logo';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (isNotificationsOpen && !event.target.closest('.nav-notifications')) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isNotificationsOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme(nextTheme);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className={`navbar ${isAuthPage ? 'is-auth' : ''}`}>
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <Logo size={24} />
          <span className="navbar-wordmark">FinTrack</span>
        </Link>

        {/* Navigation Links */}
        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {user && (
            <>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                <FaHome /> <span>Dashboard</span>
              </Link>
              <Link to="/expenses" className={`nav-link ${location.pathname === '/expenses' ? 'active' : ''}`}>
                <FaChartPie /> <span>Expenses</span>
              </Link>
              <Link to="/income" className={`nav-link ${location.pathname === '/income' ? 'active' : ''}`}>
                <FaMoneyBillWave /> <span>Income</span>
              </Link>
              <Link to="/goals" className={`nav-link ${location.pathname === '/goals' ? 'active' : ''}`}>
                <FaBullseye /> <span>Goals</span>
              </Link>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Live Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={handleToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {user ? (
            <>
              {/* Notification Popover */}
              <div className="nav-notifications">
                <button
                  className="nav-notification-btn"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <FaBell />
                  <span className="nav-notification-badge" />
                </button>

                {isNotificationsOpen && (
                  <div className="notifications-dropdown animate-scale-in">
                    <div className="notifications-header">
                      <span>Notifications</span>
                      <span className="notifications-count">3 new</span>
                    </div>
                    <div className="notifications-list">
                      <div className="notification-item unread">
                        <div className="notification-icon success">
                          <FaCheckCircle />
                        </div>
                        <div className="notification-body">
                          <p className="notification-text">Salary deposit received and logged.</p>
                          <span className="notification-time">10m ago</span>
                        </div>
                      </div>
                      <div className="notification-item unread">
                        <div className="notification-icon info">
                          <FaInfoCircle />
                        </div>
                        <div className="notification-body">
                          <p className="notification-text">Savings rate increased by 4.2% this month.</p>
                          <span className="notification-time">2h ago</span>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notification-icon info">
                          <FaInfoCircle />
                        </div>
                        <div className="notification-body">
                          <p className="notification-text">All transactions synchronized to ledger.</p>
                          <span className="notification-time">1d ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu">
                <button
                  className="user-menu-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User profile menu"
                >
                  <span className="user-avatar-initial">{getInitial(user.name)}</span>
                  <span className="user-name-label">{user.name || 'User'}</span>
                  <FaChevronDown className={`user-menu-caret ${isUserMenuOpen ? 'rotated' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown animate-scale-in">
                    <div className="user-dropdown-header">
                      <span className="user-dropdown-name">{user.name}</span>
                      <span className="user-dropdown-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item">
                      <FaUser /> Profile
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <FaCog /> Settings
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-sign-in">
                Sign In
              </Link>
              <Link to="/register" className="btn-get-started">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          {user && (
            <button
              className={`navbar-toggle ${isMobileMenuOpen ? 'is-open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;