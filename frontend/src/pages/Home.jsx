import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaShieldAlt, FaRocket, FaChartPie, FaCheckCircle, FaLock, FaSync } from 'react-icons/fa';
import heroImg from '../assets/hero-premium.png';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Finance, Reimagined.</h1>
          <p className="hero-subtitle">
            Experience the next generation of wealth management. Smart budgeting, real-time insights, and premium security—all in one place.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/" className="btn btn-primary">
                Return to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Sign In
                </Link>
              </>
            )}
          </div>
          <div className="hero-visual animate-slide-up" style={{ marginTop: '4rem' }}>
            <img
              src={heroImg}
              alt="FinTrac Premium illustration"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: '500px', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.3))' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Built for Your Financial Future</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaRocket />
            </div>
            <h3>Intelligent Tracking</h3>
            <p>Automatically categorize your spending and get smart alerts on your budget velocity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartPie />
            </div>
            <h3>Data Visualization</h3>
            <p>High-density charts and insights that help you understand where your money actually goes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Bank-Grade Security</h3>
            <p>Your data is encrypted with the highest industry standards, ensuring your privacy.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>Designed for Simplicity</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">Step 01</span>
            <h3>Connect</h3>
            <p>Seamlessly set up your account and define your primary income sources.</p>
          </div>
          <div className="step">
            <span className="step-number">Step 02</span>
            <h3>Track</h3>
            <p>Log expenses on the go with our ultra-fast mobile-optimized interface.</p>
          </div>
          <div className="step">
            <span className="step-number">Step 03</span>
            <h3>Grow</h3>
            <p>Leverage AI-driven insights to optimize your spending and reach goals faster.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Start Your Premium Financial Journey Today</h2>
        <p>Join over 10,000 users who have transformed their relationship with money.</p>
        {user ? (
          <Link to="/" className="btn btn-primary btn-lg">
            Return to Dashboard
          </Link>
        ) : (
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;