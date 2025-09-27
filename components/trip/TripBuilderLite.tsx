// components/trip/TripBuilderLite.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SectionHeader from "@/components/sections/SectionHeader";

// Pull the same curated choices you use in TripBuilderReceipt
import {
  AIRLINES,
  DESTINATIONS as DESTINATION_CHOICES,
  NATIONALITIES,
  ORIGIN_CITIES,
  HOTEL_PREFERENCES,
  FLIGHT_CLASSES,
  VISA_STATUS,
  DESTINATIONS, // used for label mapping
} from "@/lib/trip-builder/guardrails";

/* ---------------- Types ---------------- */
type Answers = {
  from?: string; // "City, Country"
  destination?: string; // "City, Country"
  startDate?: string; // ISO yyyy-mm-dd
  endDate?: string; // ISO yyyy-mm-dd
  adults?: number;
  children?: number;

  passengerName?: string;
  passengerSurname?: string;
  phoneCountryCode?: string; // "+"
  phoneNumber?: string;
  email?: string;
  nationality?: string;
  airlinePref?: string;
  hotelPref?: string;
  flightClass?: string;
  visaStatus?: string;

  seededDestination?: string;
  seedPromptShown?: boolean;
};

type StepId =
  | "fromLocation"
  | "destinationSeed"
  | "destinationSelect"
  | "dates"
  | "travellers"
  | "passengerName"
  | "phoneNumber"
  | "email"
  | "nationality"
  | "airline"
  | "hotel"
  | "flightClass"
  | "visa"
  | "summary";

/* Keep flow identical to TripBuilderReceipt */
const STEPS: StepId[] = [
  "fromLocation",
  "destinationSeed",
  "destinationSelect",
  "dates",
  "travellers",
  "passengerName",
  "phoneNumber",
  "email",
  "nationality",
  "airline",
  "hotel",
  "flightClass",
  "visa",
  "summary",
];

/* ---------------- Validation Patterns ---------------- */
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phoneCountryCode: /^\+[1-9]\d{0,2}$/,
  phoneNumber: /^\d{6,15}$/,
  name: /^[a-zA-Z\s\-'\.]+$/,
} as const;

const VALIDATION_LIMITS = {
  email: { min: 5, max: 254 },
  name: { min: 2, max: 50 },
  phoneNumber: { min: 6, max: 15 },
  phoneCountryCode: { min: 2, max: 4 },
  adults: { min: 1, max: 20 },
  children: { min: 0, max: 10 },
  totalTravelers: 25,
  tripDurationDays: 365,
  futureYears: 2,
} as const;

/* ---------------- Geolocation Hook ---------------- */
function useGeolocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  return { location, loading, error, getCurrentLocation };
}

/* ---------------- Location Matching ---------------- */
// Approximate coordinates for major cities (for demo purposes)
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "Mumbai, India": { lat: 19.0760, lon: 72.8777 },
  "Delhi, India": { lat: 28.7041, lon: 77.1025 },
  "Bangalore, India": { lat: 12.9716, lon: 77.5946 },
  "Hyderabad, India": { lat: 17.3850, lon: 78.4867 },
  "Chennai, India": { lat: 13.0827, lon: 80.2707 },
  "Kolkata, India": { lat: 22.5726, lon: 88.3639 },
  "Pune, India": { lat: 18.5204, lon: 73.8567 },
  "Ahmedabad, India": { lat: 23.0225, lon: 72.5714 },
  "Jaipur, India": { lat: 26.9124, lon: 75.7873 },
  "Lucknow, India": { lat: 26.8467, lon: 80.9462 },
  "Kanpur, India": { lat: 26.4499, lon: 80.3319 },
  "Nagpur, India": { lat: 21.1458, lon: 79.0882 },
  "Indore, India": { lat: 22.7196, lon: 75.8577 },
  "Thane, India": { lat: 19.2183, lon: 72.9781 },
  "Bhopal, India": { lat: 23.2599, lon: 77.4126 },
  "Visakhapatnam, India": { lat: 17.6868, lon: 83.2185 },
  "Pimpri-Chinchwad, India": { lat: 18.6298, lon: 73.7997 },
  "Patna, India": { lat: 25.5941, lon: 85.1376 },
  "Vadodara, India": { lat: 22.3072, lon: 73.1812 },
  "Ghaziabad, India": { lat: 28.6692, lon: 77.4538 },
  "Ludhiana, India": { lat: 30.9010, lon: 75.8573 },
  "Agra, India": { lat: 27.1767, lon: 78.0081 },
  "Nashik, India": { lat: 19.9975, lon: 73.7898 },
  "Faridabad, India": { lat: 28.4089, lon: 77.3178 },
  "Meerut, India": { lat: 28.9845, lon: 77.7064 },
  "Rajkot, India": { lat: 22.3039, lon: 70.8022 },
  "Kalyan-Dombivali, India": { lat: 19.2403, lon: 73.1305 },
  "Vasai-Virar, India": { lat: 19.4912, lon: 72.8054 },
  "Varanasi, India": { lat: 25.3176, lon: 82.9739 },
  "Srinagar, India": { lat: 34.0837, lon: 74.7973 },
  "New York, USA": { lat: 40.7128, lon: -74.0060 },
  "London, UK": { lat: 51.5074, lon: -0.1278 },
  "Dubai, UAE": { lat: 25.2048, lon: 55.2708 },
  "Singapore, Singapore": { lat: 1.3521, lon: 103.8198 },
  "Tokyo, Japan": { lat: 35.6762, lon: 139.6503 },
  "Bangkok, Thailand": { lat: 13.7563, lon: 100.5018 },
  "Bali, Indonesia": { lat: -8.3405, lon: 115.0920 },
  "Istanbul, Turkey": { lat: 41.0082, lon: 28.9784 },
  "Maldives, Maldives": { lat: 3.2028, lon: 73.2207 },
  "Phuket, Thailand": { lat: 7.8804, lon: 98.3923 },
  "Doha, Qatar": { lat: 25.2760, lon: 51.5200 },
  "Paris, France": { lat: 48.8566, lon: 2.3522 },
  "Switzerland": { lat: 46.8182, lon: 8.2275 },
  "Rajasthan, India": { lat: 27.0238, lon: 74.2179 },
  "Kerala, India": { lat: 10.8505, lon: 76.2711 },
  "Ladakh, India": { lat: 34.1526, lon: 77.5771 },
  "Himachal Pradesh, India": { lat: 31.1048, lon: 77.1734 },
};

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest city from available options
function findClosestCity(userLat: number, userLon: number, availableCities: ReadonlyArray<string>): string | null {
  let closestCity = null;
  let minDistance = Infinity;

  for (const city of availableCities) {
    const coords = CITY_COORDINATES[city];
    if (coords) {
      const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }
  }

  // Only return if within reasonable distance (500km)
  return minDistance <= 500 ? closestCity : null;
}

/* ---------------- Helpers ---------------- */
function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function fmtDateShort(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

// map labels like "Dubai, UAE" or "Dubai" back to canonical label
const DESTINATION_LABEL_TO_ID = DESTINATIONS.reduce<Record<string, string>>(
  (acc, dest) => {
    acc[dest.toLowerCase()] = dest;
    const city = dest.split(",")[0].toLowerCase();
    acc[city] = dest;
    return acc;
  },
  {}
);

function destinationSlugFromLabel(label?: string) {
  if (!label) return undefined;
  const key = label.toLowerCase().trim();
  if (DESTINATION_LABEL_TO_ID[key]) return DESTINATION_LABEL_TO_ID[key];
  const parts = label.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    const recomposedKey = `${parts[0].toLowerCase()}, ${parts[1].toLowerCase()}`;
    return DESTINATION_LABEL_TO_ID[recomposedKey];
  }
  return undefined;
}

/* ---------------- Component ---------------- */
export default function TripBuilderLite() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [idx, setIdx] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0); // allow pip jump back, not forward
  const [answers, setAnswers] = useState<Answers>({
    adults: 1,
    children: 0,
    seedPromptShown: false,
    phoneCountryCode: "+",
  });

  // Handle carousel destination selection from URL parameters
  useEffect(() => {
    const selectedDestination = searchParams.get('destination');
    if (selectedDestination && DESTINATIONS.includes(selectedDestination as any)) {
      setAnswers(prev => ({
        ...prev,
        seededDestination: selectedDestination,
        seedPromptShown: false,
      }));
    }
  }, [searchParams]);

  // Listen for destination selection events from carousel
  useEffect(() => {
    const handleDestinationSelected = (event: CustomEvent) => {
      const { destination } = event.detail;
      if (destination && DESTINATIONS.includes(destination as any)) {
        setAnswers(prev => ({
          ...prev,
          seededDestination: destination,
          seedPromptShown: false,
        }));
        
        // Reset to first step to show the seeded destination flow
        setIdx(0);
        setMaxVisited(0);
      }
    };

    window.addEventListener('destinationSelected', handleDestinationSelected as EventListener);
    return () => {
      window.removeEventListener('destinationSelected', handleDestinationSelected as EventListener);
    };
  }, []);

  // Determine current step, but skip destinationSeed if nothing is seeded
  const steps = useMemo(() => {
    if (!answers.seededDestination) {
      return STEPS.filter((s) => s !== "destinationSeed");
    }
    return STEPS;
  }, [answers.seededDestination]);

  const current = steps[idx];

  // submission state
  const [submitting, setSubmitting] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Geolocation hook
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();

  // Auto-fill origin when location is detected
  useEffect(() => {
    if (location && !answers.from) {
      const closestCity = findClosestCity(location.latitude, location.longitude, ORIGIN_CITIES);
      if (closestCity) {
        setAnswers((a) => ({ ...a, from: closestCity }));
      }
    }
  }, [location, answers.from]);

  // Attempt automatic location detection on first visit to fromLocation step
  useEffect(() => {
    if (current === "fromLocation" && !answers.from && !location && !locationLoading && !locationError) {
      // Small delay to avoid immediate popup on page load
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [current, answers.from, location, locationLoading, locationError, getCurrentLocation]);

  const hasAll = useMemo(() => {
    return Boolean(
      answers.from &&
        (answers.destination || answers.seededDestination) &&
        answers.nationality &&
        answers.startDate &&
        answers.endDate &&
        answers.passengerName?.trim() &&
        answers.passengerSurname?.trim() &&
        (answers.phoneCountryCode || "").trim() &&
        (answers.phoneNumber || "").trim() &&
        (answers.email || "").trim() &&
        answers.airlinePref &&
        answers.hotelPref &&
        answers.flightClass &&
        answers.visaStatus
    );
  }, [answers]);

  // keyboard: Enter to proceed/submit (arrow navigation disabled)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (current === "summary") {
          if (hasAll) {
            e.preventDefault();
            submitRequest();
          }
        } else if (canProceed()) {
          e.preventDefault();
          goNext();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, idx, answers, hasAll, submitting]);

  function canProceed(): boolean {
    switch (current) {
      case "fromLocation":
        return !!answers.from;
      case "destinationSeed":
        // User must either keep the seeded destination or select a new one
        return !!answers.destination;
      case "destinationSelect":
        return !!answers.destination;
      case "dates":
        if (!answers.startDate || !answers.endDate) return false;
        const today = new Date().toISOString().split('T')[0];
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 2); // Max 2 years in future
        const maxDateStr = maxDate.toISOString().split('T')[0];
        const tripDuration = (new Date(answers.endDate).getTime() - new Date(answers.startDate).getTime()) / (1000 * 60 * 60 * 24);
        
        return Boolean(
          answers.startDate >= today && // Not in the past
          answers.endDate >= answers.startDate && // End after start
          answers.startDate <= maxDateStr && // Within 2 years
          answers.endDate <= maxDateStr && // Within 2 years
          tripDuration <= 365 // Max 1 year trip duration
        );
      case "travellers":
        const adults = answers.adults ?? 0;
        const children = answers.children ?? 0;
        // Reasonable limits: 1-20 adults, 0-10 children, max 25 total
        return adults >= 1 && 
               adults <= 20 && 
               children >= 0 && 
               children <= 10 && 
               (adults + children) <= 25;
      case "passengerName":
        const name = (answers.passengerName || "").trim();
        const surname = (answers.passengerSurname || "").trim();
        // Name and surname: 2-50 characters each, letters, spaces, hyphens, apostrophes only
        return name.length >= 2 && 
               name.length <= 50 &&
               surname.length >= 1 &&
               surname.length <= 50 &&
               /^[a-zA-Z\s\-'\.]+$/.test(name) &&
               /^[a-zA-Z\s\-'\.]+$/.test(surname) &&
               !/^\s|\s$/.test(name) &&
               !/^\s|\s$/.test(surname);
      case "phoneNumber":
        const countryCode = (answers.phoneCountryCode || "").trim();
        const phoneNumber = (answers.phoneNumber || "").replace(/\s+/g, "");
        // Country code: +1 to +999, Phone: 6-15 digits
        return Boolean(
          /^\+[1-9]\d{0,2}$/.test(countryCode) &&
          /^\d{6,15}$/.test(phoneNumber)
        );
      case "email":
        const email = (answers.email || "").trim();
        // RFC 5322 compliant email with length limits (5-254 chars)
        return email.length >= 5 && 
               email.length <= 254 &&
               /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
      case "nationality":
        return !!answers.nationality;
      case "airline":
        return !!answers.airlinePref;
      case "hotel":
        return !!answers.hotelPref;
      case "flightClass":
        return !!answers.flightClass;
      case "visa":
        return !!answers.visaStatus;
      case "summary":
        return true;
      default:
        return false;
    }
  }

  function goNext() {
    if (!canProceed()) return;

    // special routing to mirror receipt flow nuances
    if (current === "fromLocation") {
      const next = answers.seededDestination
        ? "destinationSeed"
        : "destinationSelect";
      const to = steps.indexOf(next);
      setIdx(to);
      setMaxVisited((v) => Math.max(v, to));
      return;
    }
    if (current === "destinationSeed") {
      // Instead of just returning, advance to the next step after destinationSeed
      setIdx((i) => {
        const ni = Math.min(i + 1, steps.length - 1);
        setMaxVisited((v) => Math.max(v, ni));
        return ni;
      });
      return;
    }
    setIdx((i) => {
      const ni = Math.min(i + 1, steps.length - 1);
      setMaxVisited((v) => Math.max(v, ni));
      return ni;
    });
  }

  function goPrev() {
    setIdx((i) => Math.max(i - 1, 0));
  }

  // Allow jumping via pips to any visited step
  function jumpTo(i: number) {
    if (i <= maxVisited) setIdx(i);
  }

  // Focus management - only focus if user is already within the trip builder section
  const questionRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const tripBuilderSection = document.getElementById("trip-builder");
    if (tripBuilderSection) {
      const rect = tripBuilderSection.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.top < window.innerHeight;
      if (isInView && questionRef.current) {
        questionRef.current.focus({ preventScroll: true });
      }
    }
  }, [current]);

  // Simple setter without auto-advance
  function setAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  // "Keep seeded destination?" actions
  function keepSeeded() {
    if (!answers.seededDestination) return;
    setAnswers((a) => ({
      ...a,
      destination: a.seededDestination,
      seededDestination: undefined,
      seedPromptShown: true,
    }));
    // Use normal progression logic instead of jumping to dates
    setTimeout(() => {
      setIdx((i) => {
        const ni = Math.min(i + 1, steps.length - 1);
        setMaxVisited((v) => Math.max(v, ni));
        return ni;
      });
    }, 100);
  }
  function changeDestination() {
    setAnswers((a) => ({
      ...a,
      seededDestination: undefined,
      destination: undefined, // Clear any existing destination selection
      seedPromptShown: true,
    }));
    
    // Calculate the new steps array after clearing seeded destination
    const newSteps = STEPS.filter((s) => s !== "destinationSeed");
    const to = newSteps.indexOf("destinationSelect");
    
    if (to >= 0) {
      setTimeout(() => {
        setIdx(to);
        setMaxVisited((v) => Math.max(v, to));
      }, 100);
    }
  }

  async function submitRequest() {
    if (!hasAll || submitting === "saving") return;

    setSubmitting("saving");

    const payload = {
      origin: answers.from!,
      destination: answers.destination || answers.seededDestination || "",
      nationality: answers.nationality!,
      startDate: answers.startDate!,
      endDate: answers.endDate!,
      adults: answers.adults ?? 1,
      kids: answers.children ?? 0,
      airlinePreference: answers.airlinePref!,
      hotelPreference: answers.hotelPref!,
      flightClass: answers.flightClass!,
      visaStatus: answers.visaStatus!,
      passengerName: answers.passengerName!,
      passengerSurname: answers.passengerSurname!,
      email: answers.email!,
      phoneCountryCode: answers.phoneCountryCode!,
      phoneNumber: answers.phoneNumber!,
    };

    try {
      const res = await fetch("/api/trip-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json().catch(() => null);
      const createdId =
        json && typeof json === "object"
          ? (json as { id?: string }).id ?? null
          : null;

      // Associate any selected activities from cart with this trip
      if (createdId && typeof window !== 'undefined') {
        const selectedActivityIds = localStorage.getItem('selectedActivities');
        if (selectedActivityIds) {
          try {
            const activityIds = JSON.parse(selectedActivityIds);
            for (const activityId of activityIds) {
              await fetch(`/api/trip-requests/${createdId}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityId })
              });
            }
            // Clear the stored activities after successful association
            localStorage.removeItem('selectedActivities');
            console.log('Successfully associated', activityIds.length, 'activities with trip');
          } catch (error) {
            console.error('Error associating activities:', error);
          }
        }
      }

      setSubmitting("saved");

      const params = new URLSearchParams();
      const destId = destinationSlugFromLabel(payload.destination);
      if (destId) params.set("destinationId", destId);

      if (createdId) {
        router.push(
          `/trip/receipt/${createdId}${params.size ? `?${params}` : ""}`
        );
      } else {
        router.push(`/trip/receipt${params.size ? `?${params}` : ""}`);
      }
    } catch {
      setSubmitting("error");
    }
  }

  // Basic swipe navigation for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = null;
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
  }
  function onTouchEnd() {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const dx = touchEndX.current - touchStartX.current;
    if (Math.abs(dx) > 48) {
      if (dx > 0) {
        // Swipe right -> go back (but not from first step)
        if (idx > 0) goPrev();
      } else if (canProceed()) {
        // Swipe left -> go forward (but not from last step or if can't proceed)
        if (idx < steps.length - 1) goNext();
      }
    }
  }

  return (
    <section
      id="trip-builder"
      aria-labelledby="tripbuilder-heading"
      className="relative isolate w-full bg-zinc-950 text-zinc-100 overflow-x-hidden"
      // dvh avoids iOS URL bar jump; safe-area padding improves tap targets
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
      }}
    >
      {/* Vignette + linear glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_500px_at_20%_-10%,rgba(255,255,255,0.08)_0%,transparent_60%)]"
      />
      <div className="absolute inset-x-0 top-1/2 -z-10 h-32 overflow-hidden pointer-events-none">
        <div className="glowbar mx-auto h-32 w-[135%]" />
      </div>

      <div className="w-full max-w-none px-4 pt-8 pb-8 sm:px-4 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 md:max-w-2xl lg:max-w-4xl md:mx-auto">
        <div className="mb-4 sm:mb-8">
          <SectionHeader
            id="tripbuilder-heading"
            title="Trip Builder Lite"

            align="center"
            tone="light"
          />
        </div>

        <div className="relative w-full rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950/60 to-zinc-900/60 p-0.5 backdrop-blur">
          <div className="relative rounded-xl sm:rounded-2xl bg-zinc-950/60 p-3 sm:p-4 md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-white/10 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_0_40px_2px_rgba(180,180,255,0.08)_inset]"
            />

            {/* Progress (clickable for visited steps) */}
            <ProgressPips
              total={steps.length}
              index={idx}
              onJump={jumpTo}
              maxVisited={maxVisited}
            />

            <div className="mx-auto mt-3 w-full sm:max-w-md md:max-w-lg lg:max-w-2xl sm:mt-4 md:mt-6">
              <div
                ref={questionRef}
                tabIndex={-1}
                aria-live="polite"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className={[
                  "relative rounded-lg sm:rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 md:p-5",
                  "overflow-visible sm:overflow-y-auto hide-scrollbar overscroll-contain",
                  "pb-4 sm:pb-6 question-frame",
                ].join(" ")}
              >
                <div className="grid w-full gap-3 sm:gap-4 md:gap-6">
                  {current === "fromLocation" && (
                    <StepShell
                      title="Where are you traveling from?"
                    >


                      {/* Mobile: dropdown select */}
                      <div className="sm:hidden">
                        <Labeled field="origin" label="Origin">
                          <select
                            id="origin"
                            className="input"
                            value={answers.from ?? ""}
                            onChange={(e) => setAnswer("from", e.target.value)}
                          >
                            <option value="" disabled>
                              Select your traveling point
                            </option>
                            {ORIGIN_CITIES.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </Labeled>
                      </div>

                      {/* Desktop: grid of choices */}
                      <div className="hidden sm:block">
                        <ChoiceGrid
                          options={ORIGIN_CITIES}
                          value={answers.from}
                          onChange={(v) => setAnswer("from", v)}
                        />
                      </div>
                    </StepShell>
                  )}

                  {current === "destinationSeed" &&
                    answers.seededDestination && (
                      <StepShell
                        title={`Keep ${answers.seededDestination} as your destination?`}
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                          <button
                            type="button"
                            className="btn-primary min-h-[44px] touch-manipulation"
                            onClick={keepSeeded}
                          >
                            Keep {answers.seededDestination}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary min-h-[44px] touch-manipulation"
                            onClick={changeDestination}
                          >
                            Change destination
                          </button>
                        </div>
                      </StepShell>
                    )}

                  {current === "destinationSelect" && (
                    <StepShell
                      title="Pick a destination"
                      subtitle="We’ll refine specifics after you submit"
                    >
                      {/* Mobile: dropdown select */}
                      <div className="sm:hidden">
                        <Labeled field="destination" label="Destination">
                          <select
                            id="destination"
                            className="input"
                            value={answers.destination ?? ""}
                            onChange={(e) =>
                              setAnswer("destination", e.target.value)
                            }
                          >
                            <option value="" disabled>
                              Select a destination
                            </option>
                            {DESTINATION_CHOICES.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </Labeled>
                      </div>

                      {/* Desktop: grid of choices */}
                      <div className="hidden sm:block">
                        <ChoiceGrid
                          options={DESTINATION_CHOICES}
                          value={answers.destination}
                          onChange={(v) => setAnswer("destination", v)}
                        />
                      </div>
                    </StepShell>
                  )}

                  {current === "dates" && (
                    <StepShell
                      title="When do you plan to travel?"

                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <Labeled field="start-date" label="Start date">
                          <input
                            id="start-date"
                            type="date"
                            value={answers.startDate ?? ""}
                            min={new Date().toISOString().split('T')[0]}
                            max={(() => {
                              const maxDate = new Date();
                              maxDate.setFullYear(maxDate.getFullYear() + 2);
                              return Math.min(
                                new Date(maxDate).getTime(), 
                                answers.endDate ? new Date(answers.endDate).getTime() : Infinity
                              ) === new Date(maxDate).getTime() ? 
                                maxDate.toISOString().split('T')[0] :
                                answers.endDate || maxDate.toISOString().split('T')[0];
                            })()}
                            onChange={(e) => {
                              const newStartDate = e.target.value;
                              const today = new Date().toISOString().split('T')[0];
                              if (newStartDate >= today) {
                                setAnswers((a) => ({
                                  ...a,
                                  startDate: newStartDate,
                                }));
                              }
                            }}
                            className="input"
                          />
                        </Labeled>
                        <Labeled field="end-date" label="End date">
                          <input
                            id="end-date"
                            type="date"
                            value={answers.endDate ?? ""}
                            min={answers.startDate || new Date().toISOString().split('T')[0]}
                            max={(() => {
                              const maxDate = new Date();
                              maxDate.setFullYear(maxDate.getFullYear() + 2);
                              const maxTripDate = answers.startDate ? 
                                new Date(new Date(answers.startDate).getTime() + 365 * 24 * 60 * 60 * 1000) :
                                maxDate;
                              return Math.min(maxDate.getTime(), maxTripDate.getTime()) === maxDate.getTime() ?
                                maxDate.toISOString().split('T')[0] :
                                maxTripDate.toISOString().split('T')[0];
                            })()}
                            onChange={(e) => {
                              const newEndDate = e.target.value;
                              const startDate = answers.startDate;
                              if (startDate && newEndDate >= startDate) {
                                // Check max trip duration (365 days)
                                const tripDuration = (new Date(newEndDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
                                if (tripDuration <= 365) {
                                  setAnswers((a) => ({
                                    ...a,
                                    endDate: newEndDate,
                                  }));
                                }
                              } else if (!startDate) {
                                setAnswers((a) => ({
                                  ...a,
                                  endDate: newEndDate,
                                }));
                              }
                            }}
                            className="input"
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "travellers" && (
                    <StepShell
                      title="How many travelers?"

                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <Labeled field="adults" label="Adults">
                          <NumberField
                            id="adults"
                            min={1}
                            max={20}
                            value={answers.adults ?? 1}
                            onChange={(n) => {
                              // Ensure total travelers don't exceed 25
                              const children = answers.children ?? 0;
                              if (n + children <= 25) {
                                setAnswers((a) => ({ ...a, adults: n }));
                              }
                            }}
                          />
                        </Labeled>
                        <Labeled field="children" label="Children">
                          <NumberField
                            id="children"
                            min={0}
                            max={10}
                            value={answers.children ?? 0}
                            onChange={(n) => {
                              // Ensure total travelers don't exceed 25
                              const adults = answers.adults ?? 1;
                              if (adults + n <= 25) {
                                setAnswers((a) => ({ ...a, children: n }));
                              }
                            }}
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "passengerName" && (
                    <StepShell title="What's your name?">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <Labeled field="pname" label="First Name">
                          <input
                            id="pname"
                            type="text"
                            placeholder="Enter your first name"
                            inputMode="text"
                            autoComplete="given-name"
                            maxLength={50}
                            minLength={2}
                            pattern="[a-zA-Z\s\-'\.]{2,50}"
                            value={answers.passengerName ?? ""}
                            onChange={(e) => {
                              const newName = e.target.value;
                              // Allow only letters, spaces, hyphens, apostrophes, periods
                              if (/^[a-zA-Z\s\-'\.]*$/.test(newName)) {
                                setAnswers((a) => ({
                                  ...a,
                                  passengerName: newName,
                                }));
                              }
                            }}
                            className="input"
                          />
                        </Labeled>
                        <Labeled field="psurname" label="Surname">
                          <input
                            id="psurname"
                            type="text"
                            placeholder="Enter your surname"
                            inputMode="text"
                            autoComplete="family-name"
                            maxLength={50}
                            minLength={1}
                            pattern="[a-zA-Z\s\-'\.]{1,50}"
                            value={answers.passengerSurname ?? ""}
                            onChange={(e) => {
                              const newSurname = e.target.value;
                              // Allow only letters, spaces, hyphens, apostrophes, periods
                              if (/^[a-zA-Z\s\-'\.]*$/.test(newSurname)) {
                                setAnswers((a) => ({
                                  ...a,
                                  passengerSurname: newSurname,
                                }));
                              }
                            }}
                            className="input"
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "phoneNumber" && (
                    <StepShell title="Best phone number?">
                      <div className="grid grid-cols-[110px_1fr] gap-3 sm:grid-cols-[140px_1fr] sm:gap-3">
                        <Labeled field="pcode" label="Country code">
                          <input
                            id="pcode"
                            type="tel"
                            placeholder="+91"
                            inputMode="tel"
                            maxLength={4}
                            pattern="\+[1-9]\d{0,2}"
                            value={answers.phoneCountryCode ?? "+91"}
                            onChange={(e) => {
                              const newCode = e.target.value;
                              // Allow only +1 to +999 format
                              if (/^\+?[1-9]?\d{0,2}$/.test(newCode) || newCode === "+") {
                                setAnswers((a) => ({
                                  ...a,
                                  phoneCountryCode: newCode.startsWith('+') ? newCode : '+' + newCode.replace(/^\+/, ''),
                                }));
                              }
                            }}
                            className="input"
                          />
                        </Labeled>
                        <Labeled field="pnum" label="Phone number">
                          <input
                            id="pnum"
                            type="tel"
                            placeholder="98765 43210"
                            inputMode="tel"
                            autoComplete="tel"
                            maxLength={20}
                            pattern="\d{6,15}"
                            value={answers.phoneNumber ?? ""}
                            onChange={(e) => {
                              const newNumber = e.target.value;
                              // Allow only digits and spaces, max 15 digits
                              const digitsOnly = newNumber.replace(/\D/g, '');
                              if (digitsOnly.length <= 15) {
                                // Format with spaces for readability
                                const formatted = digitsOnly.replace(/(\d{5})(\d+)/, '$1 $2');
                                setAnswers((a) => ({
                                  ...a,
                                  phoneNumber: formatted,
                                }));
                              }
                            }}
                            className="input"
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "email" && (
                    <StepShell title="Where should we email your itinerary?">
                      <Labeled field="email" label="">
                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          inputMode="email"
                          autoComplete="email"
                          maxLength={254}
                          minLength={5}
                          pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
                          value={answers.email ?? ""}
                          onChange={(e) => {
                            const newEmail = e.target.value.toLowerCase().trim();
                            // Basic email format check during typing
                            if (newEmail.length <= 254) {
                              setAnswers((a) => ({
                                ...a,
                                email: newEmail,
                              }));
                            }
                          }}
                          className="input"
                        />
                      </Labeled>
                    </StepShell>
                  )}

                  {current === "nationality" && (
                    <StepShell title="What's your nationality?">
                      <ChoiceGrid
                        options={NATIONALITIES}
                        value={answers.nationality}
                        onChange={(v) => setAnswer("nationality", v)}
                      />
                    </StepShell>
                  )}

                  {current === "airline" && (
                    <StepShell title="Any airline preference?">
                      <ChoiceGrid
                        options={AIRLINES}
                        value={answers.airlinePref}
                        onChange={(v) => setAnswer("airlinePref", v)}
                      />
                    </StepShell>
                  )}

                  {current === "hotel" && (
                    <StepShell title="Hotel preference?">
                      <ChoiceGrid
                        options={[...HOTEL_PREFERENCES, "7 Star"]}
                        value={answers.hotelPref}
                        onChange={(v) => setAnswer("hotelPref", v)}
                      />
                    </StepShell>
                  )}

                  {current === "flightClass" && (
                    <StepShell title="Flight class preference?">
                      <ChoiceGrid
                        options={["Economy", "Premium Economy", "Business", "First"]}
                        value={answers.flightClass}
                        onChange={(v) => setAnswer("flightClass", v)}
                      />
                    </StepShell>
                  )}

                  {current === "visa" && (
                    <StepShell title="Do you have a visa?">
                      <ChoiceGrid
                        options={VISA_STATUS}
                        value={answers.visaStatus}
                        onChange={(v) => setAnswer("visaStatus", v)}
                      />
                    </StepShell>
                  )}

                  {current === "summary" && (
                    <StepShell title="Review and submit">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                          <Row term="From" def={answers.from} />
                          <Row
                            term="To"
                            def={
                              answers.destination || answers.seededDestination
                            }
                          />
                          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                            <Row
                              term="Start"
                              def={fmtDateShort(answers.startDate)}
                            />
                            <Row
                              term="End"
                              def={fmtDateShort(answers.endDate)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                            <Row
                              term="Adults"
                              def={String(answers.adults ?? 0)}
                            />
                            <Row
                              term="Children"
                              def={String(answers.children ?? 0)}
                            />
                          </div>
                          <Row 
                            term="Name" 
                            def={answers.passengerName && answers.passengerSurname 
                              ? `${answers.passengerName} ${answers.passengerSurname.charAt(0).toUpperCase()}.`
                              : answers.passengerName
                            } 
                          />
                          <Row
                            term="Phone"
                            def={`${answers.phoneCountryCode ?? ""} ${
                              answers.phoneNumber ?? ""
                            }`.trim()}
                          />
                          <Row term="Email" def={answers.email} />
                          <Row term="Nationality" def={answers.nationality} />
                          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                            <Row term="Airline" def={answers.airlinePref} />
                            <Row term="Class" def={answers.flightClass} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                            <Row term="Hotel" def={answers.hotelPref} />
                            <Row term="Visa" def={answers.visaStatus} />
                          </div>
                        </dl>
                      </div>
                      <p className="mt-3 text-sm text-zinc-400">
                        {submitting === "saving" && "Submitting…"}
                        {submitting === "saved" && "Redirecting…"}
                        {submitting === "error" &&
                          "We couldn’t submit your request. Refresh and try again."}
                      </p>
                    </StepShell>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Nav */}
            <div className="mt-3 sm:mt-6">
              <div className="sticky inset-x-0 bottom-0 z-10 flex w-full items-center justify-between rounded-none border border-white/10 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40 bg-zinc-900/70 sm:mx-auto sm:bottom-2 sm:w-full sm:rounded-lg sm:px-2.5 sm:py-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={idx === 0 || submitting === "saving"}
                  className="btn-secondary disabled:opacity-40 min-h-[44px] px-3 touch-manipulation text-sm"
                >
                  ← Previous
                </button>

                <div className="text-xs text-zinc-400 px-2">
                  Step {idx + 1} of {steps.length}
                </div>

                {current === "summary" ? (
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={!hasAll || submitting === "saving"}
                    className="btn-primary disabled:opacity-40 min-h-[44px] px-3 touch-manipulation text-sm"
                  >
                    {submitting === "saving" ? "Submitting…" : "Submit →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed() || submitting === "saving"}
                    className="btn-primary disabled:opacity-40 min-h-[44px] px-3 touch-manipulation text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS helpers for your dark glass aesthetic */}
      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 0.8rem 1rem;
          font-size: 16px; /* Prevents zoom on iOS */
          outline: none;
          backdrop-filter: blur(6px);
          -webkit-appearance: none;
          appearance: none;
        }
        .input:focus {
          border-color: rgba(255, 255, 255, 0.24);
          box-shadow: 0 0 0 4px rgba(180, 180, 255, 0.12);
        }
        .btn-primary {
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.18),
            rgba(255, 255, 255, 0.06)
          );
          color: white;
          padding: 0.6rem 1rem;
          font-size: 16px; /* Prevents zoom on iOS */
          backdrop-filter: blur(6px);
          font-weight: 500;
        }
        .btn-secondary {
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 0.6rem 1rem;
          font-size: 16px; /* Prevents zoom on iOS */
          backdrop-filter: blur(6px);
          font-weight: 500;
        }
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* WebKit */
        }

        /* responsive heights: only constrain on sm and up to avoid nested scroll on mobile */
        .question-frame {
          /* mobile: auto height, no fixed min/max -> single page scroll */
        }
        @media (min-width: 640px) {
          .question-frame {
            min-height: min(45dvh, 350px);
            max-height: min(55dvh, 450px);
          }
        }

        /* Responsive button and input adjustments */
        @media (max-width: 640px) {
          .input {
            font-size: 16px;
            padding: 0.7rem 0.85rem;
          }
          .btn-primary,
          .btn-secondary {
            font-size: 14px;
            padding: 0.55rem 0.9rem;
            font-weight: 600;
          }
        }
        
        @media (min-width: 641px) and (max-width: 768px) {
          .btn-primary,
          .btn-secondary {
            padding: 0.65rem 1.05rem;
            font-size: 15px;
          }
        }
        
        @media (min-width: 769px) {
          .btn-primary,
          .btn-secondary {
            padding: 0.8rem 1.3rem;
            font-size: 16px;
          }
        }
        
        @media (min-width: 1024px) {
          .btn-primary,
          .btn-secondary {
            padding: 0.8rem 1.3rem;
            font-size: 16px;
          }
        }
        
        @media (min-width: 1280px) {
          .btn-primary,
          .btn-secondary {
            padding: 0.85rem 1.4rem;
            font-size: 17px;
          }
        }

        /* Loading animation styles */
        .loading-popup {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-out;
        }
        
        .loading-card {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
          );
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1.5rem;
          padding: 2rem;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s ease-out;
          min-width: 280px;
        }
        
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        .pulse-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .pulse-dot:nth-child(2) { animation-delay: 0.2s; }
        .pulse-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(0.8); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
      `}</style>

      {/* Loading Popup */}
      {submitting === "saving" && (
        <div className="loading-popup">
          <div className="loading-card">
            <div className="spinner"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Creating Your Trip
            </h3>
            <p className="text-sm text-white/70 mb-1">
              Processing your preferences...
            </p>
            <div className="pulse-dots">
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- Little building blocks ---------------- */
function StepShell(props: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-4 xl:gap-5">
      <div className="pb-1 sm:pb-2 lg:pb-2 xl:pb-2">
        <h3 className="text-xl font-extrabold text-white leading-tight sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl tracking-tight">
          {props.title}
        </h3>
        {props.subtitle && (
          <p className="mt-1 text-xs text-zinc-400 sm:mt-1.5 sm:text-sm md:text-base lg:text-base xl:text-lg lg:mt-1.5 xl:mt-2">
            {props.subtitle}
          </p>
        )}
      </div>
      <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-4 xl:mt-5">{props.children}</div>
    </div>
  );
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<string>;
  value?: string;
  onChange: (val: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={[
              "group rounded-lg border px-3.5 py-3.5 text-left transition touch-manipulation min-h-[52px] sm:min-h-[56px]",
              "active:scale-[0.99] text-sm sm:text-base",
              active
                ? "border-white/40 bg-white/15 shadow-lg"
                : "border-white/15 bg-white/8 hover:bg-white/12 hover:border-white/25",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm leading-5 text-white font-medium sm:text-base">
                {opt}
              </span>
              <span
                className={[
                  "ml-3 inline-flex h-3.5 w-3.5 rounded-full border-2 sm:h-4 sm:w-4",
                  active
                    ? "bg-white border-white"
                    : "bg-transparent border-white/40 group-hover:border-white/60",
                ].join(" ")}
              >
                {active && (
                  <span className="m-auto h-1.5 w-1.5 rounded-full bg-zinc-900 sm:h-2 sm:w-2"></span>
                )}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Labeled({
  field,
  label,
  children,
}: {
  field: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={field} className="block">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </div>
      {children}
    </label>
  );
}

function NumberField({
  id,
  min = 0,
  max = 25,
  value,
  onChange,
}: {
  id: string;
  min?: number;
  max?: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        className="btn-secondary px-2.5 py-2 min-w-[40px] min-h-[40px] touch-manipulation sm:px-3"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, (value || 0) - 1))}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        inputMode="numeric"
        onChange={(e) => {
          const newValue = Number(e.target.value || 0);
          if (newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        className="input text-center min-h-[40px] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        style={{ MozAppearance: "textfield" as any }}
      />
      <button
        type="button"
        className="btn-secondary px-2.5 py-2 min-w-[40px] min-h-[40px] touch-manipulation sm:px-3"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, (value || 0) + 1))}
      >
        +
      </button>
    </div>
  );
}

function Row({ term, def }: { term: string; def?: string | null }) {
  return (
    <div className="rounded-lg bg-white/5 p-3">
      <dt className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
        {term}
      </dt>
      <dd className="mt-1.5 text-base sm:text-lg text-white font-bold leading-tight">
        {def || "—"}
      </dd>
    </div>
  );
}

function ProgressPips({
  total,
  index,
  onJump,
  maxVisited,
}: {
  total: number;
  index: number;
  onJump: (i: number) => void;
  maxVisited: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const visited = i <= maxVisited;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to step ${i + 1}`}
            onClick={() => visited && onJump(i)}
            className={[
              "h-2 w-7 rounded-full transition sm:h-1.5 sm:w-6",
              i <= index ? "bg-white" : "bg-white/25",
              visited ? "opacity-100" : "opacity-40 cursor-not-allowed",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
