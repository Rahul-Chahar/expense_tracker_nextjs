'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    // Load saved preference for items per page
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    if (savedItemsPerPage) {
      setItemsPerPage(parseInt(savedItemsPerPage));
    }
    
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:8080/api/expenses/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load expenses');
      }
      
      const data = await response.json();
      
      if (!data || !data.expenses) {
        throw new Error('Invalid response format');
      }
      
      // Sort expenses by date (newest first)
      const sortedExpenses = [...data.expenses].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setExpenses(sortedExpenses);
      setTotalExpenses(sortedExpenses.length);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:8080/api/expenses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding expense');
      }
      
      // Reload expenses to get the updated list
      await loadExpenses();
      return { success: true };
    } catch (error) {
      console.error('Error adding expense:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:8080/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error deleting expense');
      }
      
      // Optimistically update UI
      setExpenses(expenses.filter(expense => 
        (expense.id !== expenseId) && (expense._id !== expenseId)
      ));
      
      // Reload expenses to ensure sync with server
      await loadExpenses();
      return { success: true };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { success: false, error: error.message };
    }
  };

  const updateItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    localStorage.setItem('itemsPerPage', newItemsPerPage);
  };

  const getPaginatedExpenses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return expenses.slice(startIndex, endIndex);
  };

  return (
    <ExpenseContext.Provider value={{
      expenses,
      isLoading,
      error,
      currentPage,
      itemsPerPage,
      totalExpenses,
      setCurrentPage,
      loadExpenses,
      addExpense,
      deleteExpense,
      updateItemsPerPage,
      getPaginatedExpenses
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
