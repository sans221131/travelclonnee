"use client";
// components/SiteFooterMonochrome.tsx
// Server component. No client hooks needed.
import React from "react";
import Link from "next/link";

export default function SiteFooterMonochrome() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="relative isolate bg-black text-zinc-100"
    >
      {/* Subtle vignette (kept) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_500px_at_20%_-10%,rgba(255,255,255,0.08)_0%,transparent_60%)]"
      />

      {/* Animated linear glow — moved to middle, dulled to gray */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 -z-10 h-24 -translate-y-1/2 transform-gpu"
      >
        <div className="glowbar mx-auto h-full w-[140%]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-10 md:pt-18 md:pb-12 lg:px-8">
        {/* Hairline top divider to anchor the footer */}
        <div className="mb-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* --- Main grid --------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Left: brand, blurb, compact subscribe, socials */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs tracking-widest text-white/80">
                AT
              </span>
              <span className="text-sm font-medium tracking-wide text-white/80">
                Atlasdore Travel
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-300">
              Understated travel, engineered properly. Planning that respects your attention span
              and your calendar.
            </p>

            <div className="mt-4 text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-300">ATLASDORE TRAVEL PRIVATE LIMITED</p>
              <p>Office No: S32, 2nd Floor</p>
              <p>Al Ezz Tower, SBUT</p>
              <p>Bhendi Bazaar, Mumbai 400 003</p>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex w-full flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="f-email" className="sr-only">
                Email
              </label>
              <input
                id="f-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="h-10 w-full rounded-full border border-white/10 bg-zinc-900/60 px-4 text-sm text-white/90 outline-none placeholder:text-white/40 focus:border-white/30 sm:flex-1"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-full bg-white px-5 text-sm font-medium text-zinc-950 shadow-sm transition active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-2 text-xs text-white/40">Monthly. Useful. One-tap unsubscribe.</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { label: "Instagram", href: "#instagram" },
                { label: "LinkedIn", href: "#linkedin" },
                { label: "YouTube", href: "#youtube" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {s.label.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: four tidy link columns */}
          <div className="md:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <nav aria-labelledby="prod-col" className="text-sm">
              <h2
                id="prod-col"
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60"
              >
                Product
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="#trip-builder" className="text-white/80 transition hover:text-white">
                    Trip Builder Lite
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-white/80 transition hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#travel-search" className="text-white/80 transition hover:text-white">
                    Travel Search
                  </Link>
                </li>
                <li>
                  <Link href="#invoice" className="text-white/80 transition hover:text-white">
                    Have an Invoice?
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-labelledby="explore-col" className="text-sm">
              <h2
                id="explore-col"
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60"
              >
                Explore
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="#activities" className="text-white/80 transition hover:text-white">
                    Activities Library
                  </Link>
                </li>
                <li>
                  <Link href="#explorer" className="text-white/80 transition hover:text-white">
                    Continent Explorer
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-labelledby="company-col" className="text-sm">
              <h2
                id="company-col"
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60"
              >
                Company
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link href="#about" className="text-white/80 transition hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#careers" className="text-white/80 transition hover:text-white">
                    Careers
                  </Link>
                </li>
               
              </ul>
            </nav>

            <nav aria-labelledby="support-col" className="text-sm">
              <h2
                id="support-col"
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/60"
              >
                Support
              </h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:team@example.com"
                    className="text-white/80 transition hover:text-white"
                  >
                    Email the Team
                  </a>
                </li>
              
                <li>
                  <Link href="#support" className="text-white/80 transition hover:text-white">
                    Call Support
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* --- Legal rail -------------------------------------------------- */}
        <div className="mt-12">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex flex-col items-start justify-between gap-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center">
            <p id="footer-heading">© 2025 Atlasdore Travel Private Limited. All rights reserved.</p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <li>
                <Link href="#privacy" className="transition hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="transition hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#accessibility" className="transition hover:text-white">
                  Accessibility
                </Link>
              </li>
             
            </ul>
          </div>
        </div>
      </div>

      {/* Glow animation (dulled gray, centered) */}
      <style jsx>{`
        .glowbar {
          height: 180px;
          width: 100%;
          filter: blur(40px);
          opacity: 0.55; /* softer */
          /* neutral gray gradient instead of white */
          background: linear-gradient(
            90deg,
            rgba(148,148,148,0) 0%,
            rgba(148,148,148,0.12) 18%,
            rgba(148,148,148,0.28) 50%,
            rgba(148,148,148,0.12) 82%,
            rgba(148,148,148,0) 100%
          );
          background-repeat: no-repeat;
          background-size: 320% 100%;
          animation: glow-pan 9s linear infinite;
          /* no fancy blend mode so it stays dull */
          mix-blend-mode: normal;
        }
        @keyframes glow-pan {
          0% { background-position: -60% 0; }
          100% { background-position: 160% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .glowbar { animation: none; opacity: 0.35; }
        }
      `}</style>
    </footer>
  );
}
