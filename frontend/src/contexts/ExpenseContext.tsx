import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { Expense, ExpenseContextType } from '../types';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const fetchExpenses = useCallback(async () => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/expenses');
      const data = response.data;

      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      const processedExpenses: Expense[] = data.map((expense: any) => ({
        _id: expense._id || expense.id,
        id: expense.id || expense._id,
        description: expense.title || expense.description || 'Expense',
        amount: Number(expense.amount) || 0,
        category: expense.category || 'General',
        date: expense.date
      }));

      setExpenses(processedExpenses);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const addExpense = async (expenseData: Partial<Expense>): Promise<any> => {
    try {
      const response = await api.post('/api/expenses', expenseData);
      await fetchExpenses(); // Refresh the expenses list
      return response.data;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>): Promise<any> => {
    try {
      const response = await api.put(`/api/expenses/${id}`, expenseData);
      await fetchExpenses(); // Refresh the expenses list
      return response.data;
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/expenses/${id}`);
      await fetchExpenses(); // Refresh the expenses list
    } catch (err) {
      console.error('Error deleting expense:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const value: ExpenseContextType = {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
