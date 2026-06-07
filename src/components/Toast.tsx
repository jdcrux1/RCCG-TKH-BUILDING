'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error';

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: `max(20px, env(safe-area-inset-top))`,
        right: `max(20px, env(safe-area-inset-right))`,
        left: '20px', // give a little left padding for mobile screens
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end', // align right if space permits
        gap: '8px',
        zIndex: 9999
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              padding: '12px 20px',
              minHeight: 'var(--touch-target)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'var(--font-main)',
              fontWeight: '500',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 10px rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              animation: 'fadeIn 0.3s ease-out',
              maxWidth: '100%',
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}