import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaShieldAlt, FaChartLine, FaChartPie, FaCheckCircle, FaWallet, FaArrowRight } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">FinTrack Instrument v3.0</div>
          <h1>A serious financial instrument for personal capital.</h1>
          <p className="hero-subtitle">
            Real-time ledger tracking, disciplined budgeting, and analytical cashflow insights.
            Designed for clarity, precision, and complete data privacy.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Return to Dashboard <FaArrowRight style={{ marginLeft: 6 }} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="features">
        <div className="section-header">
          <h2>Analytical Architecture</h2>
          <p>Built on product-first principles: information first, decoration second.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaWallet />
            </div>
            <h3>Disciplined Ledger</h3>
            <p>Track multi-category expenditures and incoming streams with right-aligned tabular numerals and instant categorization.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Analytical Trends</h3>
            <p>Restrained 2px stroke visualizers and subtle area fills to observe fiscal velocity without decorative noise or glow.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Fiscal Resilience</h3>
            <p>Monitor your liquid emergency safety net, savings velocity, and goal progression with verifiable mathematical precision.</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>Operational Workflow</h2>
          <p>Three steps to total financial clarity.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-number">01</span>
            <h3>Establish Accounts</h3>
            <p>Define your primary accounts, initial balances, and baseline cash reserves.</p>
          </div>
          <div className="step">
            <span className="step-number">02</span>
            <h3>Log Cashflow</h3>
            <p>Record transactions with rapid category classification and clean timestamps.</p>
          </div>
          <div className="step">
            <span className="step-number">03</span>
            <h3>Review Health</h3>
            <p>Evaluate savings rate, budget boundaries, and milestone trajectories in real time.</p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to track with precision?</h2>
          <p>Begin managing your capital with a dedicated financial interface.</p>
          <div className="cta-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Open Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;