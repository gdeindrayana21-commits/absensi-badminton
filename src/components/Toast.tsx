import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  subMessage?: string;
  duration?: number;
}

let toastHandler: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null;

export const showToast = (message: string, type: ToastMessage['type'] = 'success', subMessage?: string) => {
  if (toastHandler) {
    toastHandler({ message, type, subMessage });
  }
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastHandler = ({ message, type, subMessage, duration = 3500 }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, subMessage, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    return () => {
      toastHandler = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-0 animate-bounce-short ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30'
                : isError
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-900/30'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-900/30'
                : 'bg-slate-900/90 border-cyan-500/50 text-cyan-100 shadow-cyan-900/30'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.message}</p>
              {toast.subMessage && <p className="text-xs mt-0.5 opacity-85">{toast.subMessage}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const Toast = ToastContainer;
export default ToastContainer;
