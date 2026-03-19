export const dynamic = 'force-dynamic';
'use client';

import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

export function ToastProvider({ children }) {
  const { toasts } = useToast();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg ${
              toast.variant === 'destructive'
                ? 'bg-red-500 text-white'
                : 'bg-white border'
            }`}
          >
            {toast.title && (
              <div className="font-semibold">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}