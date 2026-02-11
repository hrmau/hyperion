'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 bg-primary text-canvas text-xs rounded-lg shadow-lg transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {message}
    </div>
  );
}

// Simple toast state management
let toastCallback: ((message: string) => void) | null = null;

export function setToastCallback(callback: (message: string) => void) {
  toastCallback = callback;
}

export function showToast(message: string) {
  if (toastCallback) {
    toastCallback(message);
  }
}

// Provider component to add to layout
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setToastCallback(setToast);
    return () => {
      toastCallback = null;
    };
  }, []);

  return (
    <>
      {children}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
