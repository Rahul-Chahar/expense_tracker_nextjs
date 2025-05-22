'use client';

import { useState, useEffect } from 'react';
import { formatAmount } from '@/lib/formatters';

export default function ReportModal({ isOpen, onClose, isPremiumUser }) {
  const [reportType, setReportType] = useState('monthly');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen && isPremiumUser) {
      loadReport();
      loadDownloadHistory();
    }
  }, [isOpen, isPremiumUser, reportType]);

  const loadReport = async () => {
    if (!isPremiumUser) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/expenses/report/${reportType}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error('Error loading report');
      }
      
      const data = await response.json();
      setTransactions(data.transactions || []);
      
      // Calculate totals
      let income = 0;
      let expense = 0;
      
      data.transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          income += parseFloat(transaction.amount);
        } else {
          expense += parseFloat(transaction.amount);
        }
      });
      
      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDownloadHistory = async () => {
    if (!isPremiumUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/expenses/download-history', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error('Error loading download history');
      }
      
      const data = await response.json();
      setDownloadHistory(data.history || []);
    } catch (error) {
      console.error('Error loading download history:', error);
    }
  };

  const handleDownload = async () => {
    if (!isPremiumUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/expenses/download?type=${reportType}`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (!response.ok) {
        throw new Error('Error downloading report');
      }
      
      const data = await response.json();
      
      if (data.fileUrl) {
        window.open(data.fileUrl, '_blank');
        loadDownloadHistory();
      } else {
        throw new Error('File URL not found in response');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-background">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">Financial Reports</h3>
          <button onClick={onClose} className="text-foreground-alt hover:text-foreground">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <select 
            id="reportType" 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border border-border rounded-md p-2 bg-background text-foreground"
          >
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>
          <button 
            onClick={handleDownload}
            className="btn-secondary"
          >
            Download Report
          </button>
        </div>
        
        <div className="mb-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-secondary hover:underline text-sm"
          >
            {showHistory ? 'Hide Download History' : 'Show Download History'}
          </button>
        </div>
        
        {showHistory && (
          <div className="mt-4 mb-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">Download History</h3>
            <div className="space-y-3">
              {downloadHistory.length === 0 ? (
                <p className="text-foreground-alt">No download history available</p>
              ) : (
                downloadHistory.map((item, index) => (
                  <div key={index} className="bg-background-alt p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-foreground-alt">Downloaded on: {new Date(item.downloadedAt).toLocaleString()}</p>
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                      Download File
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-foreground-alt">Loading report data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Income</th>
                  <th className="p-3 text-right">Expense</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-foreground-alt">No transactions found</td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-border hover:bg-background-alt">
                      <td className="p-3 text-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-3 text-foreground">{transaction.description}</td>
                      <td className="p-3 text-foreground">{transaction.category}</td>
                      <td className="p-3 text-right text-foreground">
                        {transaction.type === 'income' ? formatAmount(transaction.amount) : ''}
                      </td>
                      <td className="p-3 text-right text-foreground">
                        {transaction.type === 'expense' ? formatAmount(transaction.amount) : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-background-alt font-semibold">
                  <td colSpan="3" className="p-3 text-foreground">Total</td>
                  <td className="p-3 text-right text-foreground">{formatAmount(totalIncome)}</td>
                  <td className="p-3 text-right text-foreground">{formatAmount(totalExpense)}</td>
                </tr>
                <tr className="bg-primary bg-opacity-10 font-semibold">
                  <td colSpan="4" className="p-3 text-foreground">Net Savings</td>
                  <td className="p-3 text-right text-foreground">{formatAmount(totalIncome - totalExpense)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
