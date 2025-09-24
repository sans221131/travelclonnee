"use client";

import { Suspense } from 'react';
import TripBuilderLite from './TripBuilderLite';

function TripBuilderFallback() {
  return (
    <section
      id="trip-builder"
      className="bg-black text-white relative w-full h-[100svh] scroll-mt-24 lg:scroll-mt-28"
      aria-label="trip-builder"
    >
      <div className="absolute inset-0">
        <div className="mx-auto max-w-6xl h-full px-4 md:px-6 py-10">
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="mb-4 h-8 w-64 bg-white/10 rounded mx-auto"></div>
              <div className="h-4 w-48 bg-white/5 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TripBuilderWrapper() {
  return (
    <Suspense fallback={<TripBuilderFallback />}>
      <TripBuilderLite />
    </Suspense>
  );
}