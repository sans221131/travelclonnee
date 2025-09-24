"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartActivity {
  id: string;
  name: string;
  imageUrl?: string;
  destinationId: string;
  price?: number;
  currency?: string;
  tripRequestId: string;
}

interface CartContextType {
  activities: CartActivity[];
  addActivity: (activity: CartActivity) => void;
  removeActivity: (activityId: string) => void;
  clearCart: () => void;
  isActivityInCart: (activityId: string) => boolean;
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<CartActivity[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('trip-cart');
      if (savedCart) {
        setActivities(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever activities change
  useEffect(() => {
    try {
      localStorage.setItem('trip-cart', JSON.stringify(activities));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [activities]);

  const addActivity = (activity: CartActivity) => {
    setActivities(prev => {
      // Check if activity is already in cart
      const exists = prev.some(a => a.id === activity.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, activity];
    });
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const removeActivity = (activityId: string) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const clearCart = () => {
    setActivities([]);
  };

  const isActivityInCart = (activityId: string) => {
    return activities.some(a => a.id === activityId);
  };

  const value: CartContextType = {
    activities,
    addActivity,
    removeActivity,
    clearCart,
    isActivityInCart,
    showNotification,
    setShowNotification,
    itemCount: activities.length,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}