"use client";

import { useCart } from '@/contexts/CartContext';
import { useEffect } from 'react';

export default function CartNotification() {
  const { showNotification, setShowNotification } = useCart();

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification, setShowNotification]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/90 p-4 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-emerald-100">Activity added to cart!</p>
            <p className="text-xs text-emerald-200/80">Check your cart to review activities</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-2 rounded-lg p-1 text-emerald-300/60 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}