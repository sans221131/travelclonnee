"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const [tripData, setTripData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Get trip ID from URL
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      router.push("/");
      return;
    }

    // Fetch trip details and activities
    const fetchTripData = async () => {
      try {
        // Fetch trip request details
        const tripResponse = await fetch(`/api/trip-requests/${tripId}`);
        if (tripResponse.ok) {
          const trip = await tripResponse.json();
          setTripData(trip);
        }

        // Fetch associated activities
        const activitiesResponse = await fetch(
          `/api/trip-requests/${tripId}/activities`
        );
        if (activitiesResponse.ok) {
          const data = await activitiesResponse.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    };

    fetchTripData();
  }, [searchParams, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/");
    }
  }, [countdown, router]);

  const cityToIATA = (city: string | undefined): string => {
    if (!city) return "---";

    // Extract city name from format like "Mumbai, India" or "Dubai, UAE"
    const cityName = city.split(",")[0].trim();

    const codes: Record<string, string> = {
      mumbai: "BOM",
      delhi: "DEL",
      bangalore: "BLR",
      kolkata: "CCU",
      chennai: "MAA",
      hyderabad: "HYD",
      pune: "PNQ",
      ahmedabad: "AMD",
      jaipur: "JAI",
      goa: "GOI",
      dubai: "DXB",
      "abu dhabi": "AUH",
      paris: "CDG",
      london: "LHR",
      "new york": "JFK",
      singapore: "SIN",
      bangkok: "BKK",
      bali: "DPS",
      maldives: "MLE",
      switzerland: "ZRH",
      himachal: "IXC",
      ladakh: "IXL",
      kerala: "COK",
      rajasthan: "JAI",
      uttarakhand: "DED",
    };
    return (
      codes[cityName.toLowerCase()] || cityName.substring(0, 3).toUpperCase()
    );
  };

  if (!tripData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500"></div>
          <p className="text-zinc-400">Loading your trip details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="mb-8 text-center animate-fadeIn">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30 animate-pulse">
            <svg
              className="h-10 w-10 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white">Thank You!</h1>
          <p className="text-lg text-zinc-300">
            Your trip request has been submitted successfully
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Our team will contact you shortly to finalize the details
          </p>
        </div>

        {/* Trip Summary Card */}
        <div className="mb-6 animate-slideUp rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
              <svg
                className="h-6 w-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Trip Details</h2>
              <p className="text-sm text-zinc-400">
                Booking Reference: {tripData.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Flight-style Summary */}
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-white">
                  {cityToIATA(tripData.origin)}
                </div>
                <div className="text-sm text-zinc-400">{tripData.origin}</div>
              </div>
              <div className="flex-1 px-6">
                <div className="relative flex items-center">
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-zinc-900 p-2">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-3xl font-bold text-white">
                  {cityToIATA(tripData.destination)}
                </div>
                <div className="text-sm text-zinc-400">
                  {tripData.destination}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Information Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs text-zinc-400">Departure Date</div>
              <div className="text-lg font-semibold text-white">
                {tripData.startDate}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs text-zinc-400">Return Date</div>
              <div className="text-lg font-semibold text-white">
                {tripData.endDate}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs text-zinc-400">Passenger Name</div>
              <div className="text-lg font-semibold text-white">
                {tripData.passengerName}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs text-zinc-400">Adults</div>
              <div className="text-lg font-semibold text-white">
                {tripData.adults}
              </div>
            </div>
            {tripData.kids > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-1 text-xs text-zinc-400">Children</div>
                <div className="text-lg font-semibold text-white">
                  {tripData.kids}
                </div>
              </div>
            )}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs text-zinc-400">Email</div>
              <div className="text-sm font-medium text-white">
                {tripData.email}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs text-zinc-400">Phone</div>
              <div className="text-sm font-medium text-white">
                {tripData.phoneCountryCode} {tripData.phoneNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Activities */}
        {activities.length > 0 && (
          <div
            className="mb-6 animate-slideUp rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-8 backdrop-blur-xl"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <svg
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Selected Activities
                </h2>
                <p className="text-sm text-zinc-400">
                  {activities.length} experience
                  {activities.length !== 1 ? "s" : ""} selected
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                    {activity.imageUrl ? (
                      <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
                        <svg
                          className="h-8 w-8"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">
                      {activity.name}
                    </h3>
                    <p className="text-sm text-zinc-400 capitalize">
                      {activity.destinationId?.replace(/-/g, " ")}
                    </p>
                    {activity.price && (
                      <p className="mt-1 text-sm font-medium text-emerald-400">
                        {activity.currency}{" "}
                        {Intl.NumberFormat("en-IN").format(activity.price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown and Redirect */}
        <div
          className="text-center animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur">
            <svg
              className="h-5 w-5 animate-spin text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-zinc-300">
              Redirecting to homepage in{" "}
              <span className="font-bold text-white">{countdown}</span> seconds
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Go to homepage now →
          </button>
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-blue-500"></div>
            <p className="text-zinc-400">Preparing your trip details...</p>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
