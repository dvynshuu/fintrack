import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaExclamationCircle, FaGoogle } from 'react-icons/fa';
import Logo from '../components/Logo';
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [submitError, setSubmitError] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Clear error when user types
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    // Form validation
    if (!name || !email || !password) {
      setSubmitError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (error) {
      setSubmitError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card-wrapper">
        <div className="register-card">
          <div className="login-card-header">
            <div className="brand-logo">
              <Logo size={28} surface={true} />
            </div>
            <h1>Create Account</h1>
            <p>Start tracking your finances with clarity and confidence</p>
          </div>

          {submitError && (
            <div className="login-alert">
              <FaExclamationCircle />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label className="field-label" htmlFor="name">Full Name</label>
              <div className="field-input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="field-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="email">Email Address</label>
              <div className="field-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="field-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="field-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="field-input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="field-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Create Account
            </button>
          </form>

          <div className="login-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-buttons">
            <button
              className="btn-social"
              type="button"
              onClick={() => {/* Google register logic */ }}
            >
              <FaGoogle />
              <span>Google</span>
            </button>
          </div>

          <div className="login-card-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;