// components/hero/HeroStatic.tsx
"use client";

import Image from "next/image";
import React from "react";

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
  return (
    <div className="relative bg-gradient-to-b from-[#101212] to-[#08201D]">
      <section
        className="relative min-h-[85svh] sm:min-h-[100svh] mb-8 sm:mb-12 pt-16 sm:pt-40 lg:pt-48 pb-8 sm:pb-10 lg:pb-12 overflow-hidden"
        aria-label="Hero"
      >
        {/* Desktop stack */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden lg:block">
          <div className="relative mx-auto max-w-7xl h-[320px]">
            {CARDS.map((c) => (
              <div key={c.id} data-card className={c.className}>
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
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-100"
                    src={c.video}
                    muted
                    autoPlay
                    playsInline
                    preload="metadata"
                    loop
                    aria-label={`${c.alt} video`}
                  />
                  <div className="pointer-events-none absolute left-3 bottom-3 px-3 py-1.5 rounded-md bg-black/50 ring-1 ring-white/10 text-white text-sm font-semibold opacity-100">
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
            {CARDS.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white/5"
              >
                <video
                  className="h-40 sm:h-48 w-full object-cover"
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
      className={`relative ${zClass} px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 mt-16 sm:mt-20 lg:mt-24`}
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
