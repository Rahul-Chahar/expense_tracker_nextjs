'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function PremiumButton({ isPremium, onBuyPremium, onShowLeaderboard, onShowReports }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyPremium = async () => {
    setIsLoading(true);
    try {
      await onBuyPremium();
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="flex items-center space-x-2">
        <button 
          onClick={onShowReports}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          View Reports
        </button>
        <button 
          onClick={onShowLeaderboard}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🏆 Leaderboard
        </button>
        <div className="bg-accent text-white px-4 py-2 rounded-lg cursor-default">
          👑 Premium User
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleBuyPremium}
      disabled={isLoading}
      className="bg-accent hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>Buy Premium</>
      )}
    </button>
  );
}
