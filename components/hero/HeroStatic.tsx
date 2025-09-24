// components/hero/HeroStatic.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

type Card = {
  id: "himachal" | "bali" | "paris" | "dubai";
  img: string;
  video: string;
  alt: string;
  className: string; // absolute position on desktop
  label: string;
};

const CARDS: Card[] = [
  {
    id: "himachal",
    img: "/hero/himachal.jpg",
    video: "/hero/himachal.mp4",
    alt: "Himachal",
    className: "absolute -left-6 bottom-6 rotate-[-10deg]",
    label: "Himachal",
  },
  {
    id: "bali",
    img: "/hero/bali.jpg",
    video: "/hero/bali.mp4",
    alt: "Bali",
    className: "absolute left-1/4 bottom-0 rotate-[5deg]",
    label: "Bali",
  },
  {
    id: "paris",
    img: "/hero/paris.jpg",
    video: "/hero/paris.mp4",
    alt: "Paris",
    className: "absolute right-1/4 bottom-10 rotate-[-4deg]",
    label: "Paris",
  },
  {
    id: "dubai",
    img: "/hero/dubai.jpg",
    video: "/hero/dubai.mp4",
    alt: "Dubai",
    className: "absolute -right-6 bottom-4 rotate-[12deg]",
    label: "Dubai",
  },
];

export default function HeroStatic() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLElement | null>(null);

  const thumbRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mobileRefs = useRef<HTMLDivElement[]>([]);
  const mobileVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useLayoutEffect(() => {
    if (!hostRef.current || !pinRef.current) return;

    // initial states
    Object.values(thumbRefs.current).forEach((el) => {
      if (!el) return;
      gsap.set(el, { y: 160, opacity: 0, scale: 0.95 });
    });
    Object.values(videoRefs.current).forEach((v) => {
      if (!v) return;
      // mobile autoplay requirements
      v.muted = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      gsap.set(v, { opacity: 0 });
    });
    Object.values(labelRefs.current).forEach(
      (el) => el && gsap.set(el, { opacity: 0, y: 12 })
    );
    mobileRefs.current.forEach(
      (el) => el && gsap.set(el, { y: 120, opacity: 0, scale: 0.97 })
    );

    // reduced-motion: reveal and play immediately
    if (prefersReduced) {
      Object.values(thumbRefs.current).forEach(
        (el) => el && gsap.set(el, { y: 0, opacity: 1, scale: 1 })
      );
      Object.values(videoRefs.current).forEach((v) => {
        if (!v) return;
        gsap.set(v, { opacity: 1 });
        v.play().catch(() => {});
      });
      Object.values(labelRefs.current).forEach(
        (el) => el && gsap.set(el, { opacity: 1, y: 0 })
      );
      mobileRefs.current.forEach(
        (el) => el && gsap.set(el, { y: 0, opacity: 1, scale: 1 })
      );
      // kick mobile videos too
      Object.values(mobileVideoRefs.current).forEach((v) => {
        if (!v) return;
        v.muted = true;
        v.autoplay = true;
        v.playsInline = true;
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        v.play().catch(() => {});
      });
      return;
    }

    const root = hostRef.current;
    const pinEl = pinRef.current;

    // entrance timeline
    const entrance = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=140%",
        scrub: 0.85,
        pin: pinEl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // desktop cards in order
    const inOrder = CARDS.map((c) => thumbRefs.current[c.id]).filter(
      Boolean
    ) as HTMLDivElement[];
    entrance.to(
      inOrder,
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.0,
        stagger: 0.22,
      },
      0.1
    );

    // fade in each desktop video and start playback
    inOrder.forEach((el, i) => {
      const id = CARDS[i].id;
      const vid = () => videoRefs.current[id]!;
      const base = 0.1 + i * 0.22;

      entrance.add(() => {
        const v = vid();
        if (!v) return;
        // make iOS happy
        v.muted = true;
        v.autoplay = true;
        v.playsInline = true;
        v.setAttribute("muted", "");
        v.setAttribute("playsinline", "");
        v.setAttribute("webkit-playsinline", "");
        const p = v.play();
        if (p && typeof (p as any).catch === "function")
          (p as any).catch(() => {});
      }, base + 0.55);

      entrance.to(
        vid(),
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        base + 0.55
      );
      entrance.to(
        labelRefs.current[id],
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        base + 0.65
      );
    });

    // mobile tiles reveal
    if (mobileRefs.current.length) {
      entrance.to(
        mobileRefs.current,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
        },
        0.14
      );
    }

    // copy entrance
    gsap
      .timeline()
      .from(
        "[data-anim='headline']",
        { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" },
        0
      )
      .from(
        "[data-anim='subhead']",
        { y: 16, opacity: 0, duration: 0.6, ease: "power2.out" },
        0.1
      );

    return () => {
      gsap.killTweensOf("*");
      ScrollTrigger.getAll().forEach((st) => st.kill());
      [
        ...Object.values(videoRefs.current),
        ...Object.values(mobileVideoRefs.current),
      ].forEach((v) => {
        try {
          v?.pause();
        } catch {}
      });
    };
  }, [prefersReduced]);

  // IntersectionObserver to nudge mobile videos to play/pause when visible
  useEffect(() => {
    const vids = Object.values(mobileVideoRefs.current).filter(
      Boolean
    ) as HTMLVideoElement[];
    if (!vids.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          const v = ent.target as HTMLVideoElement;
          if (ent.isIntersecting) {
            // make iOS Safari actually autoplay inline
            v.muted = true;
            v.autoplay = true;
            v.playsInline = true;
            v.setAttribute("muted", "");
            v.setAttribute("playsinline", "");
            v.setAttribute("webkit-playsinline", "");
            v.play().catch(() => {});
          } else {
            try {
              v.pause();
            } catch {}
          }
        });
      },
      { threshold: 0.35 }
    );

    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative bg-gradient-to-b from-[#101212] to-[#08201D]"
    >
      <section
        ref={pinRef}
        className="relative min-h-[85svh] sm:min-h-[100svh] mb-8 sm:mb-12 pt-16 sm:pt-40 lg:pt-48 pb-16 sm:pb-20 lg:pb-28 overflow-hidden"
        aria-label="Hero"
      >
        {/* Desktop stack */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden lg:block">
          <div className="relative mx-auto max-w-7xl h-[320px]">
            {CARDS.map((c) => (
              <div
                key={c.id}
                data-card
                className={c.className}
                ref={(el) => {
                  thumbRefs.current[c.id] = el;
                }}
              >
                <Frame>
                  {/* Poster underneath */}
                  <Image
                    src={c.img}
                    alt={c.alt}
                    width={520}
                    height={340}
                    className="h-full w-full object-cover"
                    priority
                  />
                  {/* Video fades in and plays */}
                  <video
                    ref={(el) => {
                      videoRefs.current[c.id] = el;
                    }}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
                    src={c.video}
                    muted
                    autoPlay
                    playsInline
                    preload="metadata"
                    loop
                    aria-label={`${c.alt} video`}
                  />
                  <div
                    ref={(el) => {
                      labelRefs.current[c.id] = el;
                    }}
                    className="pointer-events-none absolute left-3 bottom-3 px-3 py-1.5 rounded-md bg-black/50 ring-1 ring-white/10 text-white text-sm font-semibold opacity-0"
                  >
                    {c.label}
                  </div>
                </Frame>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile grid with real videos */}
        <div className="lg:hidden absolute inset-x-0 bottom-8 z-10 px-3 pb-3">
          <div className="grid grid-cols-2 gap-3">
            {CARDS.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => {
                  if (el) mobileRefs.current[i] = el;
                }}
                className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5"
              >
                <video
                  ref={(el) => {
                    mobileVideoRefs.current[c.id] = el;
                  }}
                  className="h-32 w-full object-cover"
                  src={c.video}
                  poster={c.img}
                  muted
                  autoPlay
                  playsInline
                  preload="metadata"
                  loop
                  aria-label={`${c.alt} video`}
                />
              </div>
            ))}
          </div>
        </div>

        <CopyBlock zClass="z-20" />
      </section>
    </div>
  );
}

/* ---- bits ---- */

function CopyBlock({ zClass = "z-20" }: { zClass?: string }) {
  return (
    <div
      className={`relative ${zClass} px-4 mx-auto max-w-7xl sm:px-6 lg:px-8`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1
          data-anim="headline"
          className="text-4xl font-bold sm:text-6xl lg:text-7xl leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300">
            Plan smart. Travel better.
          </span>
        </h1>
        <p
          data-anim="subhead"
          className="mt-6 sm:mt-8 text-base text-white/80 sm:text-xl lg:text-2xl leading-relaxed max-w-2xl mx-auto"
        >
          Tailored trips for Indians and NRIs. Real quotes, secure payments, and
          human help when you need it.
        </p>
        {/* CTA removed per request */}
      </div>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[220px] w-[360px] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/40 bg-white/5 backdrop-blur-[0.5px] will-change-transform">
      {children}
    </div>
  );
}
