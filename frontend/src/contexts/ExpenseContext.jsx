import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/expenses');
      const data = response.data;
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      const processedExpenses = data.map(expense => ({
        _id: expense._id,
        description: expense.title || expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      }));

      setExpenses(processedExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await api.post('/api/expenses', expenseData);
      await fetchExpenses(); // Refresh the expenses list
      return response.data;
    } catch (err) {
      console.error('Error adding expense:', err);
      throw err;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await api.put(`/api/expenses/${id}`, expenseData);
      await fetchExpenses(); // Refresh the expenses list
      return response.data;
    } catch (err) {
      console.error('Error updating expense:', err);
      throw err;
    }
  };

  const deleteExpense = async (id) => {
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
  }, []);

  const value = {
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