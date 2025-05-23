'use client';

import { useState, useEffect } from 'react';

export default function LeaderboardModal({ isOpen, onClose }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboardData();
    }
  }, [isOpen]);

  const fetchLeaderboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/premium/leaderboard', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error('Error fetching leaderboard');
      }
      
      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground">Expense Leaderboard</h2>
          <button 
            onClick={onClose} 
            className="text-foreground-alt hover:text-foreground"
            aria-label="Close leaderboard modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-error">{error}</p>
            <button 
              onClick={fetchLeaderboardData}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {leaderboardData.length === 0 ? (
              <p className="text-center text-foreground-alt py-4">No leaderboard data available</p>
            ) : (
              leaderboardData.map((user, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-border">
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2 text-foreground">{index + 1}.</span>
                    <span className="font-medium text-foreground">{user.name || "Anonymous"}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(user.totalExpenses)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
        
        <button 
          onClick={onClose} 
          className="mt-4 w-full bg-background-alt text-foreground py-2 rounded-lg hover:bg-border transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
