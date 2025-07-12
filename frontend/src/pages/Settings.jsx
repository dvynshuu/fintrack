import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';
import { FaSun, FaMoon, FaGlobe, FaBell, FaClock } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'INR',
    language: 'en',
    notifications: {
      email: true,
      push: true
    },
    display: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/api/users/settings');
      setSettings(response.data || settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = async (section, field, value) => {
    if (field === 'theme') {
      await toggleTheme(value);
    }
    
    setSettings(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage('');
      await api.put('/api/users/settings', settings);
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your app preferences</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2><FaSun /> Appearance</h2>
          <div className="form-group">
            <label>Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange(null, 'theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2><FaGlobe /> Regional</h2>
          <div className="form-group">
            <label>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange(null, 'currency', e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleChange(null, 'language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2><FaBell /> Notifications</h2>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleChange('notifications', 'email', e.target.checked)}
              />
              Email Notifications
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => handleChange('notifications', 'push', e.target.checked)}
              />
              Push Notifications
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2><FaClock /> Display</h2>
          <div className="form-group">
            <label>Date Format</label>
            <select
              value={settings.display.dateFormat}
              onChange={(e) => handleChange('display', 'dateFormat', e.target.value)}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="form-group">
            <label>Time Format</label>
            <select
              value={settings.display.timeFormat}
              onChange={(e) => handleChange('display', 'timeFormat', e.target.value)}
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 