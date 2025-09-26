// components/header/SiteHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="flex h-16 lg:h-20 items-center justify-between
                     rounded-b-xl bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/30
                     ring-1 ring-white/10 px-3 sm:px-4"
        >
          {/* Logo + Brand */}
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Home" className="flex items-center gap-2">
              {/* Logo mark */}
              <span className="inline-block h-8 w-8 rounded bg-white/90" />
              {/* Mobile brand: visible only below sm */}
              <span className="sm:hidden text-white/90 font-semibold tracking-wide text-sm whitespace-nowrap">
                LeafwayTravels
              </span>
              {/* Desktop/Tablet brand: visible from sm and up */}
              <span className="hidden sm:inline text-white/90 font-semibold tracking-wide">
                LeafWay
              </span>
            </Link>
          </div>

          <div className="flex-1" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="#destinations"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              Destinations
            </Link>
            <Link
              href="#trip-builder"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              Trip Builder
            </Link>
            <Link
              href="#how-it-works"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              How It Works
            </Link>
            <Link
              href="#invoice-quick-pay"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              Pay Invoice
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
            className="inline-flex p-2 ml-1 text-white rounded-md sm:ml-4 lg:hidden hover:bg-white/10 focus:bg-white/10 transition-colors"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M6 18L18 6"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="rounded-b-xl bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 ring-1 ring-white/10 px-3 sm:px-4 py-4">
                <nav className="flex flex-col space-y-4">
                  <Link
                    href="#destinations"
                    onClick={closeMenu}
                    className="text-base text-white/90 hover:text-white transition-colors py-2"
                  >
                    Destinations
                  </Link>
                  <Link
                    href="#trip-builder"
                    onClick={closeMenu}
                    className="text-base text-white/90 hover:text-white transition-colors py-2"
                  >
                    Trip Builder
                  </Link>
                  <Link
                    href="#how-it-works"
                    onClick={closeMenu}
                    className="text-base text-white/90 hover:text-white transition-colors py-2"
                  >
                    How It Works
                  </Link>
                  <Link
                    href="#invoice-quick-pay"
                    onClick={closeMenu}
                    className="text-base text-white/90 hover:text-white transition-colors py-2 border-t border-white/10 pt-4"
                  >
                    Pay Invoice
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
