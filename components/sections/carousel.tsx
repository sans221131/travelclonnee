// components/sections/Carousel.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

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
  dubai: "Dubai, UAE",
  thailand: "Bangkok, Thailand",
  london: "London, UK",
  "united-states": "New York, USA",
  bali: "Bali, Indonesia",
  switzerland: "Switzerland",
  paris: "Paris, France",
  bhutan: "Bhutan",
  maldives: "Maldives, Maldives",
  kerala: "Kerala, India",
  assam: "Assam, India",
  himachal: "Himachal Pradesh, India",
  meghalaya: "Meghalaya, India",
  mysore: "Mysore, India",
  rajasthan: "Rajasthan, India",
  uttarakhand: "Uttarakhand, India",
  ladakh: "Ladakh, India",
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
  // selection travel: ~60% slower and smoother
  const TRAVEL_SLOWDOWN = 1.6; // 60% slower
  const MS_PER_CARD = 280;
  const TRAVEL_MIN = 500;
  const TRAVEL_MAX = 2200;

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const centersRef = useRef<number[]>([]);

  const [active, setActive] = useState(0);
  const [gutters, setGutters] = useState({ left: 0, right: 0 });
  const [dramatic, setDramatic] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());

  // roulette state (kept for optional use)
  const [isRouletting, setIsRouletting] = useState(false);
  const [rouletteTarget, setRouletteTarget] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  // Pills (bottom bar)
  const pillsRef = useRef<HTMLDivElement | null>(null);
  const pillBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [pillsH, setPillsH] = useState(0);

  // Breakpoints
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("mobile");
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setBp(w >= 1024 ? "desktop" : w >= 640 ? "tablet" : "mobile");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

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

    const sample = cards[0];
    const viewport = root.clientWidth;
    const cardW = sample.getBoundingClientRect().width;
    const gutter = Math.max(0, Math.round((viewport - cardW) / 2));
    setGutters({ left: gutter, right: gutter });

    requestAnimationFrame(() => {
      const c: number[] = [];
      for (const el of cards) c.push(el.offsetLeft + el.clientWidth / 2);
      centersRef.current = c;
    });

    if (pillsRef.current) setPillsH(pillsRef.current.offsetHeight);
  };

  useEffect(() => {
    measureAll();
    const root = scrollerRef.current;
    if (!root) return;
    const ro = new ResizeObserver(measureAll);
    ro.observe(root);

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
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [items.length, bp]);

  useEffect(() => {
    measureAll(); // re-measure when images fade in
  }, [imagesLoaded.size]);

  /* ---------- Scroll brain ---------- */
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

        const baseIntensity = dramatic ? 1.0 : 0.65;

        for (let i = 0; i < cards.length; i++) {
          const el = cards[i];
          const delta = centers[i] - viewCenter;
          const d = Math.abs(delta);
          if (d < bestDelta) {
            bestDelta = d;
            bestIdx = i;
          }

          if (isRouletting) continue;

          const t = Math.max(-1, Math.min(1, delta / (root.clientWidth / 2)));
          const depth = 1 - Math.min(1, Math.abs(t));
          const rot = -t * 8 * baseIntensity;
          const scale = 0.95 + depth * 0.05;

          el.style.transform = `translateZ(0) perspective(1000px) rotateY(${rot}deg) scale(${scale})`;
        }

        if (bestIdx !== active && !isRouletting) setActive(bestIdx);
      });
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, [dramatic, items.length, active, isRouletting]);

  /* ---------- Snap control helpers ---------- */
  const setSnapEnabled = (on: boolean) => {
    const rail = scrollerRef.current;
    if (!rail) return;
    if (on) {
      rail.classList.remove("snap-none");
      rail.classList.add("snap-x", "snap-mandatory", "snap-always");
    } else {
      rail.classList.remove("snap-x", "snap-mandatory", "snap-always");
      rail.classList.add("snap-none");
    }
  };

  /* ---------- Programmatic scroll ---------- */
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const animateScrollTo = (left: number, ms: number) => {
    const root = scrollerRef.current;
    if (!root) return;
    if (ms <= 0) {
      root.scrollLeft = left;
      return;
    }

    setSnapEnabled(false);

    const start = root.scrollLeft;
    const change = left - start;
    const startTime = performance.now();
    const duration = Math.max(1, ms);

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const node = scrollerRef.current;
      if (!node) return;
      node.scrollLeft = start + change * easeInOutCubic(t);
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(() => setSnapEnabled(true), 0);
    };
    requestAnimationFrame(step);
  };

  const centerIndex = (idx: number, ms = 600) => {
    const root = scrollerRef.current;
    const centers = centersRef.current;
    if (!root || !centers.length) return;
    const clamped = Math.max(0, Math.min(centers.length - 1, idx));
    const targetLeft = centers[clamped] - root.clientWidth / 2;
    animateScrollTo(targetLeft, prefersReduced ? 0 : ms);
  };

  /* ---------- Smooth selection travel (60% slower) ---------- */
  const travelToIndex = (targetIndex: number) => {
    const centers = centersRef.current;
    const root = scrollerRef.current;
    if (!root || !centers.length) return;

    const clamped = Math.max(0, Math.min(centers.length - 1, targetIndex));
    const distance = Math.abs(clamped - active);
    if (distance === 0) return;

    const msRaw = distance * MS_PER_CARD * TRAVEL_SLOWDOWN;
    const ms = Math.max(TRAVEL_MIN, Math.min(TRAVEL_MAX, Math.round(msRaw)));

    const left = centers[clamped] - root.clientWidth / 2;
    setIsRouletting(false);
    setRouletteTarget(null);
    setDramatic(false);

    setActive(clamped);
    animateScrollTo(left, prefersReduced ? 0 : ms);
    centerPill(clamped);
  };

  const centerPill = (i: number) => {
    const bar = pillsRef.current;
    const btn = pillBtnRefs.current[i];
    if (!bar || !btn) return;
    const left = btn.offsetLeft - bar.clientWidth / 2 + btn.clientWidth / 2;
    bar.scrollTo({ left, behavior: prefersReduced ? "auto" : "smooth" });
  };

  // Legacy whip (kept if you still call it elsewhere)
  const whipTo = (idx: number) => {
    const root = scrollerRef.current;
    const centers = centersRef.current;
    if (!root || !centers.length) return;

    const clamped = Math.max(0, Math.min(centers.length - 1, idx));
    const baseLeft = centers[clamped] - root.clientWidth / 2;

    const dir = baseLeft > root.scrollLeft ? 1 : -1;
    const overshoot = prefersReduced ? 0 : overshootPx * dir;

    const wm = Math.round(whipMs * 1.6);

    setDramatic(true);
    animateScrollTo(baseLeft + overshoot, Math.round(wm * 0.6));
    const t1 = window.setTimeout(() => {
      animateScrollTo(baseLeft, Math.round(wm * 0.4));
      const t2 = window.setTimeout(
        () => setDramatic(false),
        Math.round(wm * 0.45)
      );
      timeoutsRef.current.push(t2);
    }, Math.round(wm * 0.6));
    timeoutsRef.current.push(t1);

    centerPill(clamped);
  };

  // Handle destination selection and scroll to trip builder
  const handleDestinationSelect = (itemId: string, delayScrolling = false) => {
    const destination = CAROUSEL_TO_DESTINATION_MAP[itemId];
    if (destination) {
      const selectedItem = items.find((item) => item.id === itemId);

      // Update URL with selected destination
      const url = new URL(window.location.href);
      url.searchParams.set("destination", destination);
      window.history.pushState({}, "", url.toString());

      // Show temporary confirmation
      const indicator = document.createElement("div");
      indicator.innerHTML = `
        <div class="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg border border-green-500 animate-pulse">
          ✓ Selected ${selectedItem?.title || destination}
        </div>
      `;
      document.body.appendChild(indicator);

      setTimeout(() => {
        if (indicator.parentNode) {
          document.body.removeChild(indicator);
        }
      }, 2000);

      // Calculate delay based on whether we need to wait for animation
      const scrollDelay = delayScrolling ? TRAVEL_MAX + 300 : 500; // Wait for max animation time + buffer

      // Scroll to trip builder section smoothly after animation completes
      setTimeout(() => {
        const tripBuilderSection = document.getElementById("trip-builder");
        if (tripBuilderSection) {
          tripBuilderSection.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
          });
        }
      }, scrollDelay);

      // Dispatch custom event to notify trip builder component
      window.dispatchEvent(new CustomEvent('destinationSelected', {
        detail: { destination, itemId }
      }));
    }
  };

  const handleImageLoad = (imageId: string) => {
    setImagesLoaded((prev) => new Set(prev).add(imageId));
  };

  const clearRouletteTimers = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  // Kept for completeness; pills/keys use travelToIndex now
  const rouletteToDestination = (targetIndex: number) => {
    if (isRouletting) return;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    clearRouletteTimers();
    setIsRouletting(true);
    setRouletteTarget(targetIndex);

    const root = scrollerRef.current;
    const centers = centersRef.current;
    if (!root || !centers.length) return;

    const currentIndex = active;

    const steps: number[] = [];
    if (targetIndex > currentIndex) {
      for (let i = currentIndex + 1; i <= targetIndex; i++) steps.push(i);
    } else if (targetIndex < currentIndex) {
      for (let i = currentIndex - 1; i >= targetIndex; i--) steps.push(i);
    } else {
      setActive(targetIndex);
      setIsRouletting(false);
      setRouletteTarget(null);
      const selectedItem = items[targetIndex];
      if (selectedItem) handleDestinationSelect(selectedItem.id);
      return;
    }

    let currentStep = 0;
    const baseSpeed = Math.round(60 * 1.6);
    const totalSteps = steps.length;

    const rouletteStep = () => {
      if (currentStep >= totalSteps) {
        const tFin = window.setTimeout(() => {
          setActive(targetIndex);
          centerIndex(targetIndex, Math.round(800 * 1.6));
          centerPill(targetIndex);

          const tEnd = window.setTimeout(() => {
            setIsRouletting(false);
            setRouletteTarget(null);
            const selectedItem = items[targetIndex];
            if (selectedItem) handleDestinationSelect(selectedItem.id);
          }, Math.round(800 * 1.6));
          timeoutsRef.current.push(tEnd);
        }, 300);
        timeoutsRef.current.push(tFin);
        return;
      }

      const nextIndex = steps[currentStep];

      const remainingSteps = totalSteps - currentStep;
      let delay = baseSpeed;
      if (remainingSteps === 3) delay = baseSpeed * 2;
      else if (remainingSteps === 2) delay = baseSpeed * 4;
      else if (remainingSteps === 1) delay = baseSpeed * 8;

      const variation = Math.random() * 0.15 - 0.075;
      delay *= 1 + variation;

      setActive(nextIndex);
      centerIndex(nextIndex, Math.min(300 * 1.6, delay * 1.5));
      currentStep++;
      const tid = window.setTimeout(rouletteStep, Math.max(80, delay));
      timeoutsRef.current.push(tid);
    };

    rouletteStep();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      travelToIndex(Math.min(items.length - 1, active + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      travelToIndex(Math.max(0, active - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      travelToIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      travelToIndex(items.length - 1);
    } else if (e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (index < items.length) travelToIndex(index);
    }
  };

  // responsive constants
  const sideExtra = bp === "desktop" ? 16 : bp === "tablet" ? 12 : 8;
  const railTopClass =
    "absolute left-1 right-1 sm:left-2 sm:right-2 lg:left-6 lg:right-6 " +
    "top-[48px] sm:top-[64px] md:top-[80px]";

  return (
    <section
      id={id}
      aria-label={title}
      // Mobile 80svh, tablet/desktop 100svh
      className="relative w-full h-[80svh] min-h-[80svh] sm:h-[100svh] sm:min-h-[100svh] bg-black text-white"
      style={{ height: "80svh" }}
    >
      {/* Header with space between title and subtitle */}
      <div className="absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent">
        <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8 pt-2.5 sm:pt-4 lg:pt-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              {title}
            </h2>
            <p
              className="text-sm sm:text-base md:text-lg text-white/80 mt-3 sm:mt-4 md:mt-5 drop-shadow-md"
              aria-live="polite"
            >
              Discover your next adventure
            </p>
          </div>
        </div>
      </div>

      {/* Carousel rail */}
      <div
        ref={scrollerRef}
        className={`${railTopClass}
                   overflow-x-auto overflow-y-visible no-scrollbar overscroll-x-contain
                   snap-x snap-mandatory snap-always flex items-center gap-2 sm:gap-3 md:gap-4 focus:outline-none`}
        style={{
          paddingLeft: `${gutters.left + sideExtra}px`,
          paddingRight: `${gutters.right + sideExtra}px`,
          bottom: `calc(env(safe-area-inset-bottom, 0px) + ${
            Math.max(bp === "desktop" ? 40 : bp === "tablet" ? 36 : 32, pillsH + 8)
          }px)`,
        }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="carousel"
        aria-label={title}
      >
        {items.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="relative snap-center shrink-0 transition-all duration-700 ease-out will-change-transform touch-manipulation"
            style={{
              width:
                bp === "desktop"
                  ? "clamp(260px, 36vw, 560px)"
                  : bp === "tablet"
                  ? "clamp(220px, 46vw, 520px)"
                  : "clamp(200px, 65vw, 480px)",
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${p.title} (${i + 1} of ${items.length})`}
          >
            <div
              className={`relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[16/10] w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-black/40 group transition-all duration-1000 ease-out cursor-pointer ${
                i === active
                  ? "ring-2 ring-white/90 ring-offset-1 ring-offset-transparent scale-100 sm:scale-105"
                  : "ring-1 ring-white/20 opacity-75 scale-95 sm:scale-98"
              }`}
              onClick={() => {
                const needsAnimation = i !== active; // Check if we need to animate to this card first
                if (needsAnimation) {
                  travelToIndex(i); // Animate to the card first
                }
                handleDestinationSelect(p.id, needsAnimation); // Then handle selection with appropriate delay
              }}
              style={
                isRouletting && i === active
                  ? {
                      transform: "scale(1.02) translateZ(10px)",
                      filter: "brightness(1.1) saturate(1.1)",
                      zIndex: 10,
                    }
                  : i === active
                  ? {
                      transform: "scale(1.0) translateZ(5px)",
                      filter: "brightness(1.05) saturate(1.05)",
                    }
                  : {
                      transform: "scale(0.95) translateZ(-5px)",
                      filter: "brightness(0.88) saturate(0.92)",
                    }
              }
            >
              {isRouletting && i === active && (
                <div className="absolute inset-0 rounded-3xl ring-2 ring-white/90 ring-offset-1 ring-offset-black pointer-events-none" />
              )}

              {i === active && (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(closest-side,rgba(255,255,255,0.20),rgba(255,255,255,0.05),transparent)] animate-pulse" />
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-white/10 via-transparent to-white/5 animate-pulse" />
                </>
              )}

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
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 60vw, 80vw"
                className={`object-cover object-center transition-all duration-1000 ease-out group-hover:scale-105 ${
                  imagesLoaded.has(p.id) ? "opacity-100" : "opacity-0"
                }`}
                priority={i === 0}
                onLoad={() => handleImageLoad(p.id)}
              />
              <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-lg">
                    {p.title}
                  </div>
                  {p.subtitle && (
                    <div className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 drop-shadow-md font-medium">
                      {p.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {i === 0 && !isRouletting && (
                <div className="md:hidden absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs text-white/90 pointer-events-none border border-white/20 animate-bounce">
                  Swipe →
                </div>
              )}

              {i === active && !isRouletting && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        ))}
        <div className="shrink-0 w-[1px]" aria-hidden />
      </div>

      {/* Pills Navigation */}
      <div className="absolute bottom-1 sm:bottom-2 inset-x-0 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
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
                    const needsAnimation = i !== active; // Check if animation is needed
                    travelToIndex(i); // smooth travel
                    handleDestinationSelect(p.id, needsAnimation); // delay scrolling if animation is needed
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
                  style={{ padding: "8px 18px" }}
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
