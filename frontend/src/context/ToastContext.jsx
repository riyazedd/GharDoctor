import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message, type = 'success') => {
    if (!message) return;

    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
  }), [show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
        {toasts.map((toastItem) => {
          const isError = toastItem.type === 'error';
          return (
            <div key={toastItem.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl ${isError ? 'border-rose-200 bg-white text-rose-800' : 'border-emerald-200 bg-white text-emerald-800'}`} role="status">
              {isError ? <CircleAlert className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
              <p className="flex-1 text-sm font-medium">{toastItem.message}</p>
              <button onClick={() => dismiss(toastItem.id)} className="rounded p-0.5 hover:bg-black/5" aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error('useToast must be used within ToastProvider');
  return toast;
}

export function ToastMessages({ error, success }) {
  const toast = useToast();
  const shownMessages = useRef(new Set());

  useEffect(() => {
    if (typeof error === 'string' && error && !shownMessages.current.has(`error:${error}`)) {
      shownMessages.current.add(`error:${error}`);
      toast.error(error);
    }
  }, [error, toast]);

  useEffect(() => {
    if (typeof success === 'string' && success && !shownMessages.current.has(`success:${success}`)) {
      shownMessages.current.add(`success:${success}`);
      toast.success(success);
    }
  }, [success, toast]);

  return null;
}
