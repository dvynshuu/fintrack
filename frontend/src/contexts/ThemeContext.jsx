import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load theme from settings when component mounts
    const loadTheme = async () => {
      try {
        const response = await api.get('/api/users/settings');
        if (response.data && response.data.theme) {
          setTheme(response.data.theme);
          document.documentElement.setAttribute('data-theme', response.data.theme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save theme preference to backend
      await api.put('/api/users/settings', {
        theme: newTheme
      });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 