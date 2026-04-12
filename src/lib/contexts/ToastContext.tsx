import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  warning: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue>(null!);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((partial: Omit<Toast, 'id'>): number => {
    const toast: Toast = { ...partial, id: ++counter };
    setToasts(prev => [...prev, toast]);
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    }
    return toast.id;
  }, []);

  const success = useCallback((message: string, duration = 4000) => add({ message, type: 'success', duration }), [add]);
  const error = useCallback((message: string, duration = 0) => add({ message, type: 'error', duration }), [add]);
  const warning = useCallback((message: string, duration = 5000) => add({ message, type: 'warning', duration }), [add]);
  const info = useCallback((message: string, duration = 4000) => add({ message, type: 'info', duration }), [add]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
