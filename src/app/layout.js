'use client';
import './globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ExpenseProvider } from '@/context/ExpenseContext';

export default function RootLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;

    const isAuthPage = path === '/login' || path === '/signup' || path.startsWith('/reset-password');

    if (!token && !isAuthPage) {
      router.push('/login');
    }
  }, [router]);

  return (
    <html lang="en">
      <head />
      <body>
        {/* Razorpay Checkout Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        <ThemeProvider>
          <AuthProvider>
            <ExpenseProvider>
              {children}
            </ExpenseProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
