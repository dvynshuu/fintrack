import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaGoogle
} from 'react-icons/fa';
import Logo from '../components/Logo';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, loginWithGoogle } = useAuth();
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
    const { email, password } = formData;

    if (!email || !password) {
      setSubmitError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setSubmitError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      setSubmitError(error.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-card-header">
            <div className="brand-logo">
              <Logo size={28} surface={true} />
            </div>
            <h1>Welcome Back</h1>
            <p>Securely sign in to your accounts</p>
          </div>

          {submitError && (
            <div className="login-alert">
              <FaExclamationCircle />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
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
                  placeholder="e.g. name@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="field-input password-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your secure password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="login-meta-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  className="remember-checkbox"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot security code?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="btn-social"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <FaGoogle />
              <span>Google</span>
            </button>
          </div>

          <div className="login-card-footer">
            Don't have an account? <Link to="/register">Join the community</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
