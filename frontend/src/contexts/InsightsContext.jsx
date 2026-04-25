import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const InsightsContext = createContext();

const DEFAULT_AI_DATA = {
  healthScore: 0,
  financialHealth: {
    savingsRate: 0,
    emergencyFund: 0,
    debtToIncome: 0,
    investmentGrowth: 0
  },
  smartSuggestions: []
};

export const useInsights = () => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
};

export const InsightsProvider = ({ children }) => {
  const [aiData, setAiData] = useState(DEFAULT_AI_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const fetchInsights = useCallback(async () => {
    if (authLoading || !user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/insights');
      setAiData(response.data);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to load AI insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Fetch insights on mount or when user changes
  useEffect(() => {
    if (user && !authLoading) {
      fetchInsights();
    }
  }, [user, authLoading, fetchInsights]);

  const value = {
    aiData,
    loading,
    error,
    refreshInsights: fetchInsights
  };

  return (
    <InsightsContext.Provider value={value}>
      {children}
    </InsightsContext.Provider>
  );
};
