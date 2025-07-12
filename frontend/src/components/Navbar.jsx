import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import './Navbar.css';
import { FaHome, FaChartPie, FaMoneyBillWave, FaBullseye, FaUser, FaCog } from 'react-icons/fa';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img 
            src={logo} 
            alt="FinTrack Logo" 
            className="navbar-logo"
          />
          <h1>FinTrac</h1>
        </Link>

        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <FaHome /> Dashboard
              </Link>
              <Link 
                to="/expenses" 
                className={`nav-link ${location.pathname === '/expenses' ? 'active' : ''}`}
              >
                <FaChartPie /> Expenses
              </Link>
              <Link 
                to="/income" 
                className={`nav-link ${location.pathname === '/income' ? 'active' : ''}`}
              >
                <FaMoneyBillWave /> Income
              </Link>
              <Link 
                to="/goals" 
                className={`nav-link ${location.pathname === '/goals' ? 'active' : ''}`}
              >
                <FaBullseye /> Goals
              </Link>
            </>
          ) : null}

          {user ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                <span>{user.name || 'User'}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M2 4L6 8L10 4" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-menu-items">
                    <Link 
                      to="/profile" 
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaUser /> Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FaCog /> Settings
                    </Link>
                    <button 
                      className="user-menu-item"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;