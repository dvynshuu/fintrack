import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { ThemeContextType } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>('light');
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Load theme from settings when component mounts and user is authenticated
    const loadTheme = async () => {
      if (authLoading || !user) return;

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
  }, [user, authLoading]);

  const toggleTheme = async (newTheme: string): Promise<void> => {
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
