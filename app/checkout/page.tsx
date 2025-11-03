"use client";

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import TripBuilderLite from '@/components/trip/TripBuilderLite';
import Image from 'next/image';
import Link from 'next/link';

function CheckoutContent() {
  const { activities, itemCount, removeActivity } = useCart();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (itemCount === 0) {
      router.push('/');
    }
  }, [itemCount, router]);

  const priceLabel = (price: number | undefined, currency: string | undefined) => {
    if (price == null) return "Price on request";
    const cur = currency ?? "";
    const val = Intl.NumberFormat("en-IN").format(price);
    return `${cur} ${val}`.trim();
  };

  const totalPrice = activities.reduce((sum, activity) => {
    return sum + (activity.price || 0);
  }, 0);

  const hasPrices = activities.some(a => a.price != null);

  if (itemCount === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900">
        <div className="text-center">
          <div className="mb-4 text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white">
      {/* Enhanced Header with gradient */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="group rounded-full border border-white/10 bg-white/5 p-2.5 text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                <svg className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  Complete Your Journey
                </h1>
                <p className="text-sm text-zinc-400 mt-0.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    {itemCount} experience{itemCount !== 1 ? 's' : ''} selected
                  </span>
                </p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Activities</span>
              </div>
              <div className="h-px w-8 bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/30">
                  2
                </div>
                <span>Details</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with better spacing */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
          
          {/* Left: Enhanced Activities Summary Card */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Activities Card */}
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">Your Itinerary</h2>
                  <p className="text-xs text-zinc-400 mt-1">{itemCount} unique experiences</p>
                </div>
                
                {/* Activities list - banner added to clarify scope */}
                <div className="px-6 pt-3">
                  <div className="rounded-lg border border-yellow-800/20 bg-yellow-900/5 py-2 px-3 text-yellow-200 text-sm flex items-start gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-yellow-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.98-1.742 2.98H3.48c-1.53 0-2.492-1.646-1.742-2.98L8.257 3.1zM9 7a1 1 0 012 0v3a1 1 0 11-2 0V7zm1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="block text-sm font-semibold text-yellow-100">Note</strong>
                      <div className="text-[13px] text-yellow-200">This estimate and itinerary reflect activities only.</div>
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-360px)] min-h-[240px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="group relative rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10">
                      <div className="flex gap-3">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg shrink-0">
                          {activity.imageUrl ? (
                            <Image
                              src={activity.imageUrl}
                              alt={activity.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-zinc-800/60 text-zinc-500">
                              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-medium text-white ring-1 ring-white/20">
                            {idx + 1}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug">{activity.name}</h3>
                          <p className="text-[11px] text-zinc-400 capitalize mt-1 flex items-center gap-1">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {activity.destinationId.replace(/-/g, ' ')}
                          </p>
                          <p className="text-sm font-semibold text-white mt-2">{priceLabel(activity.price, activity.currency)}</p>
                        </div>

                        <button
                          onClick={() => removeActivity(activity.id)}
                          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-red-500/20 text-red-400 opacity-0 transition-all hover:bg-red-500/30 group-hover:opacity-100"
                          aria-label="Remove activity"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                {hasPrices && (
                  <div className="border-t border-white/10 bg-white/5 px-6 py-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs text-zinc-400">Estimated total</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Final quote after consultation</p>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {priceLabel(totalPrice, activities[0]?.currency)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/10 px-6 py-4 bg-gradient-to-br from-blue-900/10 to-purple-900/10">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                      <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs text-zinc-300 leading-relaxed">
                      <p className="font-medium text-white mb-1">What happens next?</p>
                      <p>Our travel experts will review your selections and create a personalized itinerary with detailed pricing within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Enhanced Trip Builder Form */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Tell us about your trip</h2>
                <p className="text-sm text-zinc-400">Help us craft the perfect experience for you</p>
              </div>
              
              <Suspense fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 animate-spin items-center justify-center rounded-full border-2 border-white/10 border-t-white/60"></div>
                    <p className="text-sm text-zinc-400">Loading form...</p>
                  </div>
                </div>
              }>
                <TripBuilderLite />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="mb-4 text-zinc-400">Loading checkout...</div>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
