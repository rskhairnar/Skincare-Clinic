// app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import {ToastProvider} from '../components/providers/ToastProvider'
import { AuthProvider } from '../components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Skincare Clinic Admin',
  description: 'Admin panel for Skincare Clinic Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}