"use client";

import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { activities, removeActivity, clearCart, itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  const priceLabel = (price: number | undefined, currency: string | undefined) => {
    if (price == null) return "Price on request";
    const cur = currency ?? "";
    const val = Intl.NumberFormat("en-IN").format(price);
    return `${cur} ${val}`.trim();
  };

  const handleConfirmActivities = async () => {
    setShowCheckout(true);
    setCountdown(5);
    
    // Save activities to database
    try {
      // Create a basic trip request with minimal data
      const tripRequestData = {
        origin: 'User Selected Location', // This could be enhanced to get from form data
        destination: activities[0]?.destinationId || 'Multiple Destinations',
        nationality: 'To be determined',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        adults: 2, // Default values
        airlinePreference: 'No preference',
        hotelPreference: 'No preference',
        flightClass: 'economy',
        visaStatus: 'not-required',
        passengerName: 'Customer',
        email: 'customer@example.com', // This should be collected from user
        phoneCountryCode: '+1',
        phoneNumber: '1234567890'
      };

      // Create trip request
      const tripResponse = await fetch('/api/trip-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripRequestData)
      });

      if (!tripResponse.ok) {
        throw new Error('Failed to create trip request');
      }

      const tripRequest = await tripResponse.json();
      
      // Add each activity to the trip request
      for (const activity of activities) {
        await fetch(`/api/trip-requests/${tripRequest.id}/activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activityId: activity.id })
        });
      }

      console.log('Trip request created successfully:', tripRequest.id);
    } catch (error) {
      console.error('Error saving to database:', error);
      // Continue with the checkout flow even if database save fails
    }
  };

  // Countdown and redirect effect
  useEffect(() => {
    if (showCheckout && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCheckout && countdown === 0) {
      clearCart();
      setShowCheckout(false);
      setIsOpen(false);
      router.push('/');
    }
  }, [showCheckout, countdown, router]);

  if (showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="mx-4 max-w-md rounded-2xl border border-white/10 bg-zinc-950/95 p-8 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Thank You!</h2>
          <p className="mb-4 text-sm text-zinc-300">
            Your activities have been submitted successfully.
          </p>
          <p className="text-xs text-zinc-400">
            Our team will contact you shortly to finalize your trip details.
          </p>
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <span>Redirecting to home in</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {countdown}
              </div>
              <span>seconds...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/80 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-zinc-900/90 hover:border-white/20 hover:shadow-2xl"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19h6" />
        </svg>
        <span className="text-sm font-medium">Cart</span>
        {itemCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90 text-xs font-bold text-white ring-2 ring-emerald-400/30">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-zinc-950 shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Your Cart</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-zinc-400">{itemCount} activity{itemCount !== 1 ? 'ies' : 'y'} added</p>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {activities.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white/5 p-4">
                      <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h10a1 1 0 001-1v-6M9 19h6" />
                      </svg>
                    </div>
                    <p className="text-zinc-400">Your cart is empty</p>
                    <p className="text-sm text-zinc-500">Add activities to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                            {activity.imageUrl ? (
                              <Image
                                src={activity.imageUrl}
                                alt={activity.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white line-clamp-2">{activity.name}</h3>
                            <p className="text-xs text-zinc-400 capitalize">{activity.destinationId.replace(/-/g, ' ')}</p>
                            <p className="text-sm text-zinc-300 mt-1">{priceLabel(activity.price, activity.currency)}</p>
                          </div>
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {activities.length > 0 && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  <button
                    onClick={() => clearCart()}
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-zinc-300 hover:bg-white/10"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleConfirmActivities}
                    className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    Confirm Activities
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}