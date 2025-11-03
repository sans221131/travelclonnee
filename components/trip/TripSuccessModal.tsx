"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TripSuccessModalProps {
  isOpen: boolean;
  tripData: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    adults: number;
    kids: number;
    passengerName: string;
    phoneCountryCode: string;
    phoneNumber: string;
  };
}

// Convert city names to IATA airport codes
function cityToIATA(cityName: string): string {
  const normalized = cityName.toLowerCase().trim();
  
  const iataMap: Record<string, string> = {
    // Indian cities
    "mumbai": "BOM",
    "mumbai, india": "BOM",
    "delhi": "DEL", 
    "delhi, india": "DEL",
    "bangalore": "BLR",
    "bangalore, india": "BLR",
    "bengaluru": "BLR",
    "hyderabad": "HYD",
    "chennai": "MAA",
    "kolkata": "CCU",
    "pune": "PNQ",
    "ahmedabad": "AMD",
    "jaipur": "JAI",
    // International
    "new york": "NYC",
    "new york, usa": "NYC",
    "london": "LHR",
    "london, uk": "LHR",
    "dubai": "DXB",
    "dubai, uae": "DXB",
    "singapore": "SIN",
    "singapore, singapore": "SIN",
    "tokyo": "TYO",
    "tokyo, japan": "TYO",
    "bangkok": "BKK",
    "bangkok, thailand": "BKK",
    "paris": "CDG",
    "paris, france": "CDG",
    "bali": "DPS",
    "bali, indonesia": "DPS",
  };

  return iataMap[normalized] || cityName.split(',')[0].substring(0, 3).toUpperCase();
}

function fmtDate(dateStr: string) {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function TripSuccessModal({ isOpen, tripData }: TripSuccessModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative mx-4 w-full max-w-2xl animate-slideUp">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30">
            <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Trip Summary Card */}
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-zinc-950/70 to-zinc-900/60 p-0.5 backdrop-blur">
          <div className="relative rounded-[28px] bg-zinc-950/60 p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/10 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_0_40px_2px_rgba(180,180,255,0.08)_inset]"
            />

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90 animate-pulse" />
                Trip Confirmed
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">Your trip has been submitted successfully!</h2>
              <p className="mt-2 text-sm text-zinc-400">Our team will contact you within 24 hours</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
              {/* Plane Icon */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10">
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    className="opacity-90 text-white"
                    aria-hidden
                  >
                    <path
                      d="M21 16.5V14l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2.5l8-2v4l-2 1.5V21l3-1 3 1v-1.5L13 19v-4l8 1.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              {/* Route Info */}
              <div className="min-w-0 text-center sm:text-left">
                <h3 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
                  {cityToIATA(tripData.origin)}
                  <span className="mx-3 inline-flex items-center text-zinc-400">
                    <span className="mx-2 hidden h-px w-8 bg-white/20 sm:inline-block" />
                    →
                    <span className="mx-2 hidden h-px w-8 bg-white/20 sm:inline-block" />
                  </span>
                  {cityToIATA(tripData.destination)}
                </h3>

                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {fmtDate(tripData.startDate)} <span className="text-zinc-400">to</span>{" "}
                    {fmtDate(tripData.endDate)}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {tripData.adults} adult{tripData.adults === 1 ? "" : "s"}
                    {tripData.kids > 0 && `, ${tripData.kids} child${tripData.kids === 1 ? "" : "ren"}`}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {tripData.passengerName}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {`${tripData.phoneCountryCode} ${tripData.phoneNumber}`.trim()}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Line */}
            <div
              aria-hidden
              className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />

            {/* Countdown */}
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-400">
                Redirecting to homepage in{" "}
                <span className="font-semibold text-white">{countdown}</span> seconds...
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Go now →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
