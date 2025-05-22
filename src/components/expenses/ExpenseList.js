'use client';

import { useState, useEffect } from 'react';
import ExpenseItem from './ExpenseItem';

export default function ExpenseList({ expenses, onDelete, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(itemsPerPage);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  
  useEffect(() => {
    setFilteredExpenses(expenses || []);
  }, [expenses]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredExpenses.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, filteredExpenses.length);
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);
  
  const handleItemsPerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('itemsPerPage', newPerPage);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleDeleteExpense = (expenseId) => {
    if (onDelete) {
      onDelete(expenseId);
    }
  };
  
  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-foreground mb-4">Recent Expenses</h2>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm text-foreground-alt">Items per page:</label>
          <select 
            id="itemsPerPage" 
            value={perPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 border border-border rounded-lg text-foreground bg-background"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <p className="text-center text-foreground-alt">No expenses found</p>
        ) : (
          currentExpenses.map((expense) => (
            <ExpenseItem 
              key={expense.id || expense._id || expenseId} 
              expense={expense} 
              onDelete={handleDeleteExpense} 
            />
          ))
        )}
      </div>
      
      {filteredExpenses.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-foreground-alt">
            Showing {startIndex + 1} to {endIndex} of {filteredExpenses.length} Expenses
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded-lg hover:bg-background-alt text-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-lg ${
                    page === currentPage
                      ? "bg-primary text-white"
                      : "hover:bg-background-alt text-foreground border-border"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-border rounded-lg hover:bg-background-alt text-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
