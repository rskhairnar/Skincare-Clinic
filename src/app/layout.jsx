// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Skincare Clinic Admin',
  description: 'Admin panel for Skincare Clinic Management System',
};

// ✅ No 'use client' here
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}