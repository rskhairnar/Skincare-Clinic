'use client';

import { useToast } from '@/components/ui/use-toast';

export function ToastProvider({ children }) {
  const { toasts, dismiss } = useToast();

  const getStyles = (variant) => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-white text-gray-900 border border-gray-200 shadow-lg';
    }
  };

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              p-4 pr-10 rounded-lg shadow-lg relative
              transform transition-all duration-300 ease-in-out
              ${toast.open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
              ${getStyles(toast.variant)}
            `}
          >
            {/* Close Button */}
            <button
              onClick={() => dismiss(toast.id)}
              className={`
                absolute top-2 right-2 w-6 h-6 
                flex items-center justify-center
                rounded-full transition-colors text-lg leading-none
                ${toast.variant === 'destructive' || toast.variant === 'success'
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-gray-100 text-gray-500'
                }
              `}
            >
              ×
            </button>

            {/* Content */}
            {toast.title && (
              <div className="font-semibold text-sm">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm mt-1 opacity-90">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}