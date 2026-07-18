'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: 'bg-accent text-white',
  error: 'bg-down text-white',
  info: 'bg-foreground text-white dark:bg-surface-elevated dark:text-foreground',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      role="alert"
      className={[
        'animate-fade-in shadow-card flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-medium',
        typeStyles[toast.type],
      ].join(' ')}
    >
      {toast.message}
    </div>
  );
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 left-1/2 z-[9999] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export { ToastProvider, useToast };
