import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { AiData, InsightsContextType } from '../types';

const InsightsContext = createContext<InsightsContextType | undefined>(undefined);

const DEFAULT_AI_DATA: AiData = {
  healthScore: 0,
  financialHealth: {
    savingsRate: 0,
    emergencyFund: 0,
    debtToIncome: 0,
    investmentGrowth: 0
  },
  smartSuggestions: []
};

export const useInsights = (): InsightsContextType => {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
};

interface InsightsProviderProps {
  children: ReactNode;
}

export const InsightsProvider: React.FC<InsightsProviderProps> = ({ children }) => {
  const [aiData, setAiData] = useState<AiData>(DEFAULT_AI_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const fetchInsights = useCallback(async (): Promise<void> => {
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

  const value: InsightsContextType = {
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
