// components/sections/Carousel.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Place = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  alt?: string;
};

type CarouselProps = {
  id?: string;
  title?: string;
  items: Place[];
  darkOverlay?: number;
  overshootPx?: number;
  whipMs?: number;
  respectReducedMotion?: boolean;
};

// Mapping between carousel item IDs and destination names for trip builder
const CAROUSEL_TO_DESTINATION_MAP: Record<string, string> = {
  "dubai": "Dubai, UAE",
  "thailand": "Bangkok, Thailand", // Using Bangkok as primary Thai destination
  "london": "London, UK",
  "united-states": "New York, USA", // Using NYC as primary US destination
  "bali": "Bali, Indonesia",
  "switzerland": "Switzerland",
  "paris": "Paris, France",
  "bhutan": "Phuket, Thailand", // Mapping Bhutan to nearest available destination
  "maldives": "Maldives, Maldives",
  "kerala": "Kerala, India",
  "assam": "Kerala, India", // Mapping Assam to Kerala (closest available)
  "himachal": "Himachal Pradesh, India",
  "meghalaya": "Himachal Pradesh, India", // Mapping to closest available
  "mysore": "Kerala, India", // Mapping to Kerala (closest South Indian destination)
  "rajasthan": "Rajasthan, India",
  "uttarakhand": "Himachal Pradesh, India", // Mapping to closest mountain destination
  "ladakh": "Ladakh, India",
};

export default function Carousel({
  id = "destinations",
  title = "Top Picks",
  items,
  darkOverlay = 0.25,
  overshootPx = 120,
  whipMs = 720,
  respectReducedMotion = true,
}: CarouselProps) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const centersRef = useRef<number[]>([]);
  const [active, setActive] = useState(0);
  const [gutters, setGutters] = useState({ left: 0, right: 0 });
  const [dramatic, setDramatic] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());

  // roulette state
  const [isRouletting, setIsRouletting] = useState(false);
  const [rouletteTarget, setRouletteTarget] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  // Pills (bottom bar)
  const pillsRef = useRef<HTMLDivElement | null>(null);
  const pillBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pillsH, setPillsH] = useState(0); // dynamic height of pills bar

  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const overlay = Math.max(0, Math.min(1, darkOverlay));

  /* ---------- Measurement ---------- */
  const measureAll = () => {
    const root = scrollerRef.current;
    if (!root) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length) return;

    // center-first gutter (assumes equal card width)
    const sample = cards[0];
    const viewport = root.clientWidth;
    const cardW = sample.getBoundingClientRect().width;
    const gutter = Math.max(0, Math.round((viewport - cardW) / 2));
    setGutters({ left: gutter, right: gutter });

    // compute card centers in scroll coordinates after padding applies
    requestAnimationFrame(() => {
      const c: number[] = [];
      for (const el of cards) c.push(el.offsetLeft + el.clientWidth / 2);
      centersRef.current = c;
    });

    // measure pills height
    if (pillsRef.current) setPillsH(pillsRef.current.offsetHeight);
  };

  useEffect(() => {
    measureAll();
    const root = scrollerRef.current;
    if (!root) return;
    const ro = new ResizeObserver(measureAll);
    ro.observe(root);

    // observe pills height (wraps on desktop; changes on resize)
    let roPills: ResizeObserver | null = null;
    if (pillsRef.current) {
      roPills = new ResizeObserver(() => {
        if (pillsRef.current) setPillsH(pillsRef.current.offsetHeight);
      });
      roPills.observe(pillsRef.current);
    }

    return () => {
      ro.disconnect();
      if (roPills) roPills.disconnect();
      // cleanup any pending roulette timeouts on unmount
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [items.length]);

  /* ---------- Scroll brain (no per-frame rect reads) ---------- */
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;

        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;

        const centers = centersRef.current;
        if (!centers.length) return;

        const viewCenter = root.scrollLeft + root.clientWidth / 2;

        let bestIdx = active;
        let bestDelta = Number.POSITIVE_INFINITY;

        const isMobile =
          typeof window !== "undefined" && window.innerWidth < 768;
        const baseIntensity = dramatic ? 1.0 : 0.65;
        const blurMax = dramatic ? (isMobile ? 2 : 3) : (isMobile ? 1 : 1.5);

        for (let i = 0; i < cards.length; i++) {
          const el = cards[i];
          const delta = centers[i] - viewCenter;
          const d = Math.abs(delta);
          if (d < bestDelta) {
            bestDelta = d;
            bestIdx = i;
          }

          // Skip applying scroll effects during roulette to let CSS styling work
          if (isRouletting) {
            // Only update the active index during roulette, don't apply visual effects
            continue;
          }

          const t = Math.max(-1, Math.min(1, delta / (root.clientWidth / 2)));
          const depth = 1 - Math.min(1, Math.abs(t));

          const rot = -t * 15 * baseIntensity; // Enhanced 3D rotation
          const scale = 0.85 + depth * 0.15; // More dramatic scale for 3D effect
          const opacity = 0.6 + depth * 0.4; // Better contrast between active/inactive
          const blur = Math.max(0, Math.abs(t) * blurMax);

          // Apply smooth CSS transitions with 3D effect and smart scaling
          el.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out';
          el.style.transform = `translateZ(0) perspective(1000px) rotateY(${rot}deg) scale(${scale})`;
          el.style.opacity = `${opacity}`;

          const img = el.querySelector<HTMLElement>("[data-img]");
          if (img) {
            img.style.transition = 'filter 0.3s ease-out';
            img.style.filter = `blur(${blur}px) saturate(${0.7 + depth * 0.3}) brightness(${0.85 + depth * 0.15})`;
          }
        }

        if (bestIdx !== active && !isRouletting) setActive(bestIdx);
      });
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [dramatic, items.length, active, isRouletting]);

  /* ---------- Programmatic scroll ---------- */
  const animateScrollTo = (left: number, ms: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    if (ms <= 0) {
      root.scrollLeft = left;
      return;
    }
    const start = root.scrollLeft;
    const change = left - start;
    const startTime = performance.now();
    const duration = Math.max(1, ms);
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const node = scrollerRef.current;
      if (!node) return; // stop if unmounted
      node.scrollLeft = start + change * easeInOutCubic(t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const centerIndex = (idx: number, ms = 500) => {
    const root = scrollerRef.current;
    const centers = centersRef.current;
    if (!root || !centers.length) return;
    const clamped = Math.max(0, Math.min(centers.length - 1, idx));
    const targetLeft = centers[clamped] - root.clientWidth / 2;
    animateScrollTo(targetLeft, prefersReduced ? 0 : ms);
  };

  const centerPill = (i: number) => {
    const bar = pillsRef.current;
    const btn = pillBtnRefs.current[i];
    if (!bar || !btn) return;
    const left = btn.offsetLeft - bar.clientWidth / 2 + btn.clientWidth / 2;
    bar.scrollTo({ left, behavior: prefersReduced ? "auto" : "smooth" });
  };

  const whipTo = (idx: number) => {
    const root = scrollerRef.current;
    const centers = centersRef.current;
    if (!root || !centers.length) return;

    const clamped = Math.max(0, Math.min(centers.length - 1, idx));
    const baseLeft = centers[clamped] - root.clientWidth / 2;

    const dir = baseLeft > root.scrollLeft ? 1 : -1;
    const overshoot = prefersReduced ? 0 : overshootPx * dir;

    setDramatic(true);
    animateScrollTo(baseLeft + overshoot, Math.round(whipMs * 0.6));
    const t1 = window.setTimeout(() => {
      animateScrollTo(baseLeft, Math.round(whipMs * 0.4));
      const t2 = window.setTimeout(() => setDramatic(false), Math.round(whipMs * 0.45));
      timeoutsRef.current.push(t2);
    }, Math.round(whipMs * 0.6));
    timeoutsRef.current.push(t1);

    centerPill(clamped);
  };

  // Touch gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null || isRouletting) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      const nextIndex = Math.min(items.length - 1, active + 1);
      // Use simple centering instead of roulette for swipes
      centerIndex(nextIndex);
      centerPill(nextIndex);
    } else if (isRightSwipe) {
      const prevIndex = Math.max(0, active - 1);
      // Use simple centering instead of roulette for swipes
      centerIndex(prevIndex);
      centerPill(prevIndex);
    }
  };

  // Handle destination selection - just collect data, no redirect
  const handleDestinationSelect = (itemId: string) => {
    const destination = CAROUSEL_TO_DESTINATION_MAP[itemId];
    if (destination) {
      // Find the selected item for better feedback
      const selectedItem = items.find(item => item.id === itemId);
      
      // Show a brief success indicator
      const indicator = document.createElement('div');
      indicator.innerHTML = `
        <div class="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg border border-green-500 animate-pulse">
          ✓ Selected ${selectedItem?.title || destination}
        </div>
      `;
      document.body.appendChild(indicator);
      
      // Remove indicator after 2 seconds
      setTimeout(() => {
        document.body.removeChild(indicator);
      }, 2000);
      
      // Just update URL parameters without redirecting
      const url = new URL(window.location.href);
      url.searchParams.set('destination', destination);
      window.history.pushState({}, '', url.toString());
      
      // Log the selection for debugging
      console.log('Destination selected:', { itemId, destination, selectedItem });
    }
  };

  const handleImageLoad = (imageId: string) => {
    setImagesLoaded((prev) => new Set(prev).add(imageId));
  };

  const clearRouletteTimers = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const rouletteToDestination = (targetIndex: number) => {
    if (isRouletting) return; // Prevent stacking roulettes
    if (targetIndex < 0 || targetIndex >= items.length) return; // Bounds check
    
    clearRouletteTimers();
    setIsRouletting(true);
    setRouletteTarget(targetIndex);

    const root = scrollerRef.current;
    const centers = centersRef.current;
    if (!root || !centers.length) return;

    const currentIndex = active;
    const totalItems = items.length;

    // Calculate full circle + target position
    const fullCircle = totalItems;
    const extraRotations = Math.floor(Math.random() * 2) + 1; // 1-2 extra rotations
    const totalSteps =
      fullCircle * extraRotations +
      ((targetIndex - currentIndex + totalItems) % totalItems);

    let currentStep = 0;
    const baseSpeed = 80; // Slightly slower for smoother effect

    const rouletteStep = () => {
      if (currentStep >= totalSteps) {
        const tFin = window.setTimeout(() => {
          setActive(targetIndex);
          centerIndex(targetIndex, 800);
          centerPill(targetIndex);

          // Pointer functionality removed

          const tEnd = window.setTimeout(() => {
            setIsRouletting(false);
            setRouletteTarget(null);
            
            // Auto-fill destination in trip builder when roulette completes
            const selectedItem = items[targetIndex];
            if (selectedItem) {
              handleDestinationSelect(selectedItem.id);
            }
          }, 800);
          timeoutsRef.current.push(tEnd);
        }, 300);
        timeoutsRef.current.push(tFin);
        return;
      }

      const nextIndex = (currentIndex + currentStep + 1) % totalItems;

      // Enhanced realistic deceleration like real roulette
      const progress = currentStep / totalSteps;
      let delay = baseSpeed;

      if (progress < 0.5) {
        // Fast spinning phase (50% of rotation)
        delay = baseSpeed;
      } else if (progress < 0.7) {
        // Start slowing down (20% of rotation)
        const slowProgress = (progress - 0.5) / 0.2;
        delay = baseSpeed + slowProgress * baseSpeed;
      } else if (progress < 0.85) {
        // Significant slowdown (15% of rotation)
        const slowProgress = (progress - 0.7) / 0.15;
        delay = baseSpeed * 2 + slowProgress * baseSpeed * 2;
      } else if (progress < 0.95) {
        // Major slowdown (10% of rotation)
        const slowProgress = (progress - 0.85) / 0.1;
        delay = baseSpeed * 4 + slowProgress * baseSpeed * 3;
      } else {
        // Final crawl (last 5% - very slow)
        const slowProgress = (progress - 0.95) / 0.05;
        delay = baseSpeed * 7 + slowProgress * baseSpeed * 5;
      }

      // Add realistic physics variation
      const variation = Math.random() * 0.2 - 0.1; // Reduced variation for smoother effect
      delay *= 1 + variation;

      // Pointer functionality removed - no wobble needed

      setActive(nextIndex);
      centerIndex(nextIndex, Math.min(400, delay * 2)); // Smoother centering

      currentStep++;
      const tid = window.setTimeout(rouletteStep, Math.max(100, delay));
      timeoutsRef.current.push(tid);
    };

    rouletteStep();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isRouletting) return; // block during roulette

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      rouletteToDestination(Math.min(items.length - 1, active + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      rouletteToDestination(Math.max(0, active - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      rouletteToDestination(0);
    } else if (e.key === "End") {
      e.preventDefault();
      rouletteToDestination(items.length - 1);
    } else if (e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (index < items.length) rouletteToDestination(index);
    }
  };

  useEffect(() => {
    centerPill(active);
  }, [active]);

  return (
    <section
      id={id}
      aria-label={title}
      className="relative w-full h-[100svh] min-h-[100svh] bg-black text-white"
      style={{ height: "100svh" }}
    >
      {/* Header - more compact for phones */}
      <div className="absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              {title}
            </h2>
            <p
              className="text-xs sm:text-sm md:text-base text-white/80 mt-0.5 sm:mt-1 drop-shadow-md"
              aria-live="polite"
            >
              {isRouletting ? "🎲 Selecting destination..." : "Discover your next adventure"}
            </p>
          </div>
        </div>
      </div>



      {/* Carousel rail - mobile optimized */}
      <div
        ref={scrollerRef}
        className="absolute left-1 right-1 sm:left-3 sm:right-3 lg:left-6 lg:right-6
                   top-[85px] sm:top-[105px] md:top-[125px]
                   overflow-x-auto overflow-y-visible no-scrollbar overscroll-x-contain
                   snap-x snap-mandatory snap-always flex items-center gap-2 sm:gap-3 md:gap-4 focus:outline-none"
        style={{
          paddingLeft: `${gutters.left + 20}px`, // Adjusted for mobile
          paddingRight: `${gutters.right + 20}px`, // Adjusted for mobile
          bottom: `${Math.max(70, pillsH + 24)}px`, // Tighter for mobile
        }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-roledescription="carousel"
        aria-label={title}
      >
        {items.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="relative snap-center shrink-0 transition-all duration-500 ease-out will-change-transform
                       touch-manipulation"
            style={{ width: "clamp(200px, 65vw, 500px)" }} // Smaller, more phone-friendly
            role="group"
            aria-roledescription="slide"
            aria-label={`${p.title} (${i + 1} of ${items.length})`}
          >
            {/* Phone-optimized aspect ratio - more compact */}
            <div
              className={`relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[16/10] w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-black/40 group transition-all duration-700 ease-out ${
                i === active
                  ? "ring-2 ring-white/90 ring-offset-1 ring-offset-transparent scale-100 sm:scale-105"
                  : "ring-1 ring-white/20 opacity-75 scale-95 sm:scale-98"
              }`}
              style={
                isRouletting && i === active
                  ? {
                      // Clean selection styling during roulette - no orange effects
                      transform: "scale(1.02) translateZ(10px)",
                      filter: "brightness(1.1) saturate(1.1)",
                      zIndex: 10,
                    }
                  : i === active ? {
                      transform: "scale(1.0) translateZ(5px)",
                      filter: "brightness(1.05) saturate(1.05)",
                    } : {
                      transform: "scale(0.95) translateZ(-5px)",
                      filter: "brightness(0.85) saturate(0.9) blur(0.3px)",
                    }
              }
            >
              {/* Force selection ring during roulette - reduced to prevent cutoff */}
              {isRouletting && i === active && (
                <div className="absolute inset-0 rounded-3xl ring-2 ring-white/90 ring-offset-1 ring-offset-black pointer-events-none" />
              )}

              {/* Same radiating highlight for active card whether rouletting or static - contained within bounds */}
              {i === active && (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(closest-side,rgba(255,255,255,0.20),rgba(255,255,255,0.05),transparent)] animate-pulse" />
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-white/10 via-transparent to-white/5 animate-pulse" />
                </>
              )}

              {/* Loading skeleton */}
              {!imagesLoaded.has(p.id) && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="h-6 bg-white/20 rounded-lg animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              )}

              <Image
                data-img
                src={p.image}
                alt={p.alt || p.title}
                fill
                sizes="(min-width: 1024px) 60vw, (min-width: 640px) 70vw, 80vw"
                className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
                  imagesLoaded.has(p.id) ? "opacity-100" : "opacity-0"
                }`}
                priority={i === 0}
                onLoad={() => handleImageLoad(p.id)}
              />
              <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />

              {/* Content overlay - more compact for phones */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                    {p.title}
                  </div>
                  {p.subtitle ? (
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 drop-shadow-md font-medium">
                      {p.subtitle}
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-white/75 drop-shadow-md">
                      Discover amazing destinations
                    </div>
                  )}
                  <div className="pt-1 sm:pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent double triggering
                        handleDestinationSelect(p.id);
                      }}
                      className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium hover:bg-white/30 transition-all duration-200 border border-white/30"
                    >
                      <span>Explore</span>
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>



              {/* Mobile swipe indicator - only show on first card when not rouletting */}
              {i === 0 && !isRouletting && (
                <div className="md:hidden absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white/90 pointer-events-none border border-white/20 animate-bounce">
                  Swipe →
                </div>
              )}

              {/* Active destination selection indicator */}
              {i === active && !isRouletting && (
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white font-semibold pointer-events-none border border-white/30 animate-pulse">
                  Click to Select
                </div>
              )}

              {/* Shimmer for active card */}
              {i === active && !isRouletting && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        ))}
        <div className="shrink-0 w-[1px]" aria-hidden />
      </div>

      {/* Pills Navigation */}
      <div className="absolute bottom-3 inset-x-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* edge fades on mobile */}
            <div className="pointer-events-none md:hidden absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
            <div className="pointer-events-none md:hidden absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black via-black/70 to-transparent z-10" />

            <div
              ref={pillsRef}
              role="tablist"
              aria-label="Destinations filter"
              className="
                flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-1
                snap-x snap-mandatory
                md:flex-wrap md:overflow-visible md:snap-none md:justify-center
              "
            >
              {items.map((p, i) => (
                <button
                  key={p.id}
                  ref={(el) => {
                    pillBtnRefs.current[i] = el;
                  }}
                  onClick={() => {
                    if (i === active && !isRouletting) {
                      // If clicking the active pill, select the destination
                      handleDestinationSelect(p.id);
                    } else {
                      // Otherwise, just navigate to that destination in carousel
                      rouletteToDestination(i);
                    }
                  }}
                  role="tab"
                  aria-selected={i === active}
                  aria-controls={`${id}-slide-${i}`}
                  disabled={isRouletting}
                  className={`
                    relative snap-center whitespace-nowrap rounded-full border text-sm font-medium transition-all duration-300
                    backdrop-blur-sm text-center
                    hover:scale-105 active:scale-95 touch-manipulation
                    px-4 py-2 md:px-4 md:py-2
                    min-w-fit
                    ${isRouletting ? "opacity-75" : ""}
                    ${
                      i === rouletteTarget && isRouletting
                        ? "border-white text-white bg-white/25 shadow-lg shadow-white/50 scale-110"
                        : i === active
                        ? "border-white/80 text-white bg-white/15 md:bg-white md:text-black md:border-white md:shadow-lg shadow-white/25 scale-105"
                        : "border-white/30 text-white/90 hover:bg-white/10 hover:border-white/50 shadow-lg shadow-black/25"
                    }
                  `}
                  style={{ padding: '8px 18px' }}
                >
                  <span className="inline-block translate-y-[0.5px] tracking-wide">
                    {p.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
