'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useExpenses } from '@/context/ExpenseContext';
import Navbar from '@/components/layout/Navbar';
import ExpenseForm from '@/components/expenses/ExpenseForm';
import ExpenseList from '@/components/expenses/ExpenseList';
import ReportModal from '@/components/premium/ReportModal';
import LeaderboardModal from '@/components/premium/LeaderboardModal';
import PremiumButton from '@/components/premium/PremiumButton';

export default function ExpensesPage() {
  const { theme } = useTheme();
  const { isPremium, checkPremiumStatus } = useAuth();
  const { expenses, isLoading, loadExpenses, deleteExpense } = useExpenses();
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });

  const showNotification = (message, isError = false) => {
    setNotification({ show: true, message, isError });
    setTimeout(() => {
      setNotification({ show: false, message: '', isError: false });
    }, isError ? 5000 : 3000);
  };

  const handleExpenseAdded = async () => {
    await loadExpenses();
    showNotification('Expense added successfully');
  };

  const handleExpenseDeleted = async (expenseId) => {
    const result = await deleteExpense(expenseId);
    if (result.success) {
      showNotification('Expense deleted successfully');
    } else {
      showNotification(result.error || 'Error deleting expense', true);
    }
  };

  const initiatePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:8080/api/payments/create-order", {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();

      // Initialize Razorpay
      const options = {
        key: data.key_id,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const updateResponse = await fetch("http://localhost:8080/api/payments/update-status", {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                status: "SUCCESSFUL",
              })
            });

            if (!updateResponse.ok) {
              throw new Error('Failed to update payment status');
            }

            showNotification("Payment successful! You are now a premium member!");
            await checkPremiumStatus(token);
          } catch (error) {
            showNotification("Error processing payment", true);
            console.error(error);
          }
        },
        theme: {
          color: theme === 'dark' ? "#059669" : "#10B981", // Match primary color based on theme
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showNotification("Error initiating payment", true);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background-alt transition-colors duration-300">
      <Navbar />
      
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg z-50 ${
            notification.isError ? 'bg-error' : 'bg-success'
          } animate-fadeIn`}
        >
          {notification.message}
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <PremiumButton 
            isPremium={isPremium}
            onBuyPremium={initiatePayment}
            onShowLeaderboard={() => setShowLeaderboardModal(true)}
            onShowReports={() => setShowReportModal(true)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Expense Form */}
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          
          {/* Recent Expenses */}
          <ExpenseList 
            expenses={expenses} 
            onDelete={handleExpenseDeleted}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      {/* Premium Report Modal */}
      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        isPremiumUser={isPremium}
      />
      
      {/* Leaderboard Modal */}
      <LeaderboardModal 
        isOpen={showLeaderboardModal} 
        onClose={() => setShowLeaderboardModal(false)}
      />
    </div>
  );
}
