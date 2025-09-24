// components/how-it-works/DigitalDockingDivs.tsx
"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Step = {
  id: string;
  title: string;
  body: string;
  href?: string;
};

type DigitalDockingDivsProps = {
  steps?: Step[];
  /** number of tiny pips on each band's rails */
  pipCount?: number;
  /** subtle side glow sweep */
  glowEnabled?: boolean;
  /** moving highlight sweep across the band */
  sweepEnabled?: boolean;
  /** 3D tilt on hover (desktop only) */
  hoverTilt?: boolean;
  /** snap scroll to each step boundary */
  snap?: boolean;
  /** optional section title override */
  heading?: string;
};

const DEFAULT_STEPS: Step[] = [
  {
    id: "plan",
    title: "Plan Precisely",
    body: "Share goals, constraints, and rough dates. We map feasibility in 24–48h.",
  },
  {
    id: "curate",
    title: "Curate Fast",
    body: "Handpicked hotels, flights, and visa guidance matched to your constraints.",
  },
  {
    id: "quote",
    title: "Quote Clearly",
    body: "Crystal pricing. No mystery fees. You approve, we lock inventory.",
  },
  {
    id: "invoice",
    title: "Invoice Simply",
    body: "You get an invoice ref. Pay by reference; we reconcile instantly.",
  },
  {
    id: "depart",
    title: "Travel Confident",
    body: "Final confirmations, WhatsApp support, and live changes if needed.",
  },
];

/** tiny util to build stable ref arrays */
function makeRefArray<T>(n: number) {
  const arr = Array<T | null>(n).fill(null);
  const setAt = (i: number) => (el: T | null) => {
    arr[i] = el;
  };
  return [arr, setAt] as const;
}

export default function DigitalDockingDivs({
  steps = DEFAULT_STEPS,
  pipCount = 18,
  glowEnabled = true,
  sweepEnabled = true,
  hoverTilt = true,
  snap = true,
  heading = "How It Works",
}: DigitalDockingDivsProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // refs per-step
  const [shellRefs, setShell] = makeRefArray<HTMLLIElement>(steps.length);
  const [bandRefs, setBand] = makeRefArray<HTMLDivElement>(steps.length);
  const [fillRefs, setFill] = makeRefArray<HTMLDivElement>(steps.length);
  const [sweepRefs, setSweep] = makeRefArray<HTMLDivElement>(steps.length);
  const [beaconRefs, setBeacon] = makeRefArray<HTMLDivElement>(steps.length);
  const [glowRefs, setGlow] = makeRefArray<HTMLDivElement>(steps.length);
  const [badgeRefs, setBadge] = makeRefArray<HTMLSpanElement>(steps.length);
  const [textRefs, setText] = makeRefArray<HTMLDivElement>(steps.length);

  // runtime guardrails - use state to avoid hydration mismatch
  const [clientSettings, setClientSettings] = useState({
    reduced: false,
    lowPower: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const tiny = window.matchMedia?.("(max-width: 640px)")?.matches ?? false;
    const highDPR =
      typeof window.devicePixelRatio === "number" &&
      window.devicePixelRatio > 2;
    const bodyFlag = document.documentElement.dataset.lowfx === "1";
    const lowPower = tiny || highDPR || bodyFlag;

    setClientSettings({ reduced, lowPower });
  }, []);

  const sweepOn = false; // Disabled light animation
  const glowOn = false; // Disabled light animation
  const tiltOn =
    hoverTilt && !clientSettings.reduced && !clientSettings.lowPower;

  // Use fixed pip count to avoid hydration mismatch
  const pipCountEffective = Math.max(8, pipCount);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Filter out null refs before setting properties
      const validBandRefs = bandRefs.filter(Boolean);
      const validFillRefs = fillRefs.filter(Boolean);
      const validBeaconRefs = beaconRefs.filter(Boolean);
      const validSweepRefs = sweepRefs.filter(Boolean);
      const validGlowRefs = glowRefs.filter(Boolean);

      // Only proceed if we have valid refs
      if (validBandRefs.length === 0) return;

      // Make all elements visible immediately (static appearance)
      if (validBandRefs.length > 0)
        gsap.set(validBandRefs, { opacity: 1, y: 0 });
      if (validFillRefs.length > 0)
        gsap.set(validFillRefs, { width: 0, opacity: 0.7 });
      if (validBeaconRefs.length > 0) gsap.set(validBeaconRefs, { opacity: 1 });

      // Hide sweep and glow initially
      if (validSweepRefs.length > 0) gsap.set(validSweepRefs, { opacity: 0 });
      if (!glowOn && validGlowRefs.length > 0)
        gsap.set(validGlowRefs, { opacity: 0 });

      // Create a single scroll-based animation for the entire section
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1, // smooth scrubbing
          onUpdate: (self) => {
            const progress = self.progress;

            // Update each step based on global progress
            bandRefs.forEach((band, i) => {
              if (!band) return;

              const fill = fillRefs[i];
              const sweep = sweepRefs[i];
              const beacon = beaconRefs[i];
              const glow = glowRefs[i];

              // Determine if this step should be illuminated
              const stepStart = i / steps.length;
              const stepEnd = (i + 1) / steps.length;
              const stepProgress = Math.max(
                0,
                Math.min(1, (progress - stepStart) / (stepEnd - stepStart))
              );

              // Animate fill based on step progress - with null check
              if (fill) {
                gsap.set(fill, {
                  width: `${stepProgress * 100}%`,
                  opacity: stepProgress > 0 ? 0.7 : 0.3,
                });
              }

              // Animate beacon position - with null check
              if (beacon) {
                gsap.set(beacon, {
                  left: `${stepProgress * 100}%`,
                  opacity: stepProgress > 0.1 ? 1 : 0.3,
                  scale: stepProgress > 0.1 ? 1 : 0.8,
                });
              }

              // Animate sweep highlight - with null check
              if (sweep && sweepOn && stepProgress > 0) {
                gsap.set(sweep, {
                  xPercent: stepProgress * 120 - 20,
                  opacity: stepProgress > 0.1 ? 0.4 : 0,
                });
              }

              // Animate glow - with null check
              if (glow && glowOn && stepProgress > 0) {
                gsap.set(glow, {
                  xPercent: stepProgress * 150 - 50,
                  opacity: stepProgress > 0.1 ? 0.6 : 0,
                });
              }
            });
          },
        },
      });

      // Optional desktop tilt
      if (tiltOn && window.matchMedia("(hover: hover)").matches) {
        bandRefs.forEach((band) => {
          if (!band) return;

          let rect = band.getBoundingClientRect();
          const ro = new ResizeObserver(() => {
            rect = band.getBoundingClientRect();
          });
          ro.observe(band);

          const onEnter = () => (rect = band.getBoundingClientRect());
          const onMove = (e: PointerEvent) => {
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            band.style.setProperty("--rx", `${-(dy * 2)}deg`);
            band.style.setProperty("--ry", `${dx * 3}deg`);
          };
          const onLeave = () => {
            band.style.setProperty("--rx", "0deg");
            band.style.setProperty("--ry", "0deg");
          };

          band.addEventListener("pointerenter", onEnter, { passive: true });
          band.addEventListener("pointermove", onMove, { passive: true });
          band.addEventListener("pointerleave", onLeave, { passive: true });

          // cleanup on unmount
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (band as any).__cleanupTilt = () => {
            ro.disconnect();
            band.removeEventListener("pointerenter", onEnter);
            band.removeEventListener("pointermove", onMove);
            band.removeEventListener("pointerleave", onLeave);
          };
        });
      }

      // Section-level snapping to each step (keep if desired)
      if (snap) {
        let stops: number[] = [];
        const computeStops = () => {
          const sec = sectionRef.current!;
          const secTop = sec.getBoundingClientRect().top + window.scrollY;
          const total = Math.max(1, sec.scrollHeight - window.innerHeight);
          stops = shellRefs.map((li) => {
            if (!li) return 0;
            const top = li.getBoundingClientRect().top + window.scrollY;
            const p = (top - secTop) / total;
            return Math.min(1, Math.max(0, p));
          });
        };
        computeStops();
        const snapST = ScrollTrigger.create({
          id: "runway-snap",
          trigger: sectionRef.current!,
          start: "top top",
          end: () =>
            `+=${Math.max(
              1,
              sectionRef.current!.scrollHeight - window.innerHeight
            )}`,
          snap: {
            snapTo: (value) =>
              stops.length ? gsap.utils.snap(stops, value) : value,
            duration: 0.3,
            ease: "power1.inOut",
          },
          onRefreshInit: computeStops,
          onRefresh: computeStops,
        });

        // cleanup snap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sectionRef.current as any).__cleanupSnap = () => snapST.kill();
      }
    }, sectionRef);

    return () => {
      // cleanup tilt listeners
      bandRefs.forEach((el) => {
        if (!el) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as any).__cleanupTilt?.();
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sectionRef.current as any)?.__cleanupSnap?.();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, sweepOn, glowOn, tiltOn, snap, clientSettings.reduced]);

  // simple pip renderer
  const renderPips = (prefix: string) =>
    Array.from({ length: pipCountEffective }).map((_, i) => (
      <div
        key={`${prefix}${i}`}
        className="h-[1.5px] w-2 sm:h-[2px] sm:w-3 rounded-full bg-white/60 opacity-20"
      />
    ));

  return (
    <section
      ref={sectionRef}
      aria-labelledby="howitworks-heading"
      className="relative isolate bg-zinc-950 text-zinc-100"
    >
      {/* soft backdrop + glow bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_520px_at_18%_-10%,rgba(255,255,255,0.09)_0%,transparent_60%)]"
      />
      <div className="absolute inset-x-0 top-8 sm:top-12 -z-10 h-16 sm:h-24 overflow-hidden">
        <div className="glowbar mx-auto h-16 sm:h-24 w-[130%]" />
      </div>

      <div className="mx-auto max-w-[980px] px-3 sm:px-4 lg:px-5 pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 lg:pb-20">
        <header className="mb-6 sm:mb-7 lg:mb-9 text-center">
          <h2
            id="howitworks-heading"
            className="text-6xl font-semibold tracking-tight"
          >
            {heading}
          </h2>
          <p className="mt-2 text-base sm:text-xl lg:text-2xl text-zinc-400 max-w-2xl mx-auto">
            Five phases. The runway lights guide you from left to right.
          </p>
        </header>

        <ol className="space-y-4 sm:space-y-6 lg:space-y-7">
          {steps.map((s: Step, i: number) => (
            <li
              key={s.id}
              ref={setShell(i)}
              className="relative min-h-[72px] sm:min-h-[88px] lg:min-h-[96px]"
            >
              <div
                ref={setBand(i)}
                className={[
                  "absolute inset-0 group rounded-xl sm:rounded-2xl lg:rounded-[26px] border border-white/10",
                  "bg-zinc-900/40 px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4.5",
                  "transition-transform duration-200 will-change-transform",
                  "[transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]",
                  clientSettings.lowPower ? "" : "backdrop-blur",
                  "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.45)]",
                ].join(" ")}
              >
                {/* dotted runway texture */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-[26px] opacity-[.14]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 14px 50%, rgba(255,255,255,.18) 2px, transparent 2px)",
                    backgroundSize: "40px 12px sm:60px 18px",
                    backgroundPosition: "0 50%",
                  }}
                />

                {/* top and bottom pips - hidden on mobile */}
                <div className="absolute inset-x-2 sm:inset-x-3 top-1.5 sm:top-2 hidden md:flex items-center justify-between gap-1">
                  {renderPips("t")}
                </div>
                <div className="absolute inset-x-2 sm:inset-x-3 bottom-1.5 sm:bottom-2 hidden md:flex items-center justify-between gap-1">
                  {renderPips("b")}
                </div>

                {/* progress fill */}
                <div
                  ref={setFill(i)}
                  className="absolute inset-y-0 left-0 w-0 will-change-[transform,opacity,width] [transform:translateZ(0)]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.00) 100%)",
                  }}
                />

                {/* side glow sweep */}
                {glowOn && (
                  <div
                    ref={setGlow(i)}
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 will-change-transform [transform:translateZ(0)]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(185,190,255,0.9), transparent)",
                      filter: "blur(12px)",
                      opacity: 0.6,
                    }}
                  />
                )}

                {/* moving highlight */}
                {sweepOn && (
                  <div
                    ref={setSweep(i)}
                    className="pointer-events-none absolute top-0 h-full w-16 sm:w-24 lg:w-36 opacity-0 will-change-[transform,opacity] [transform:translateZ(0)]"
                    style={{
                      left: "-10%",
                      background:
                        "radial-gradient(60%_100% at 50% 50%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.0) 70%)",
                      mixBlendMode: "screen",
                    }}
                  />
                )}

                {/* beacon dot */}
                <div
                  ref={setBeacon(i)}
                  className="absolute top-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-3.5 lg:w-3.5 -translate-y-1/2 rounded-full bg-white"
                  style={{
                    left: "-6px",
                    boxShadow:
                      "0 0 10px rgba(255,245,230,.55), 0 0 28px rgba(255,200,150,.25)",
                  }}
                />

                {/* content grid */}
                <div
                  className="relative grid items-center gap-x-2 sm:gap-x-3 lg:gap-x-6 overflow-visible"
                  style={{ gridTemplateColumns: "var(--col-spec)" }}
                >
                  <span
                    ref={setBadge(i)}
                    className="inline-flex h-6 sm:h-7 lg:h-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-1.5 sm:px-2 text-[9px] sm:text-[10px] lg:text-[11px] font-semibold tracking-wide text-white flex-shrink-0"
                  >
                    STEP {i + 1}
                  </span>

                  <div className="leading-tight text-white flex-shrink-0">
                    <h3 className="text-sm sm:text-[16px] md:text-[18px] lg:text-[20px] font-semibold">
                      {s.title}
                    </h3>
                  </div>

                  <div
                    ref={setText(i)}
                    className="text-xs sm:text-[14px] lg:text-[15px] text-zinc-300 min-w-0"
                  >
                    {s.body}
                    {s.href ? (
                      <a
                        href={s.href}
                        className="ml-2 inline-flex items-center text-[11px] sm:text-[13px] text-zinc-200 underline decoration-zinc-500/60 underline-offset-2 hover:text-white"
                      >
                        Learn more →
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* responsive column spec */}
      <style jsx>{`
        :global(section[aria-labelledby="howitworks-heading"]) {
          --col-spec: 60px minmax(100px, 160px) 1fr;
        }
        @media (min-width: 640px) {
          :global(section[aria-labelledby="howitworks-heading"]) {
            --col-spec: 74px minmax(120px, 180px) 1fr;
          }
        }
        @media (min-width: 1024px) {
          :global(section[aria-labelledby="howitworks-heading"]) {
            --col-spec: 86px minmax(140px, 200px) 1fr;
          }
        }
        @media (min-width: 1280px) {
          :global(section[aria-labelledby="howitworks-heading"]) {
            --col-spec: 92px minmax(160px, 240px) 1fr;
          }
        }
      `}</style>
    </section>
  );
}
