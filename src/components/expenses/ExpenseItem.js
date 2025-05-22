'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/formatters';

export default function ExpenseItem({ expense, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/expenses/${expense.id || expense._id || expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error deleting expense');
      }
      
      if (onDelete) {
        onDelete(expense.id || expense._id || expenseId);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="bg-background rounded-lg shadow-sm p-4 mb-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{expense.description}</p>
          <p className="text-sm text-foreground-alt">{expense.category}</p>
          <p className="text-xs text-foreground-alt">{new Date(expense.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-semibold ${expense.type === 'income' ? 'text-success' : 'text-error'}`}>
            {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}
          </span>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="text-foreground-alt hover:text-error transition-colors"
            aria-label="Delete expense"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
