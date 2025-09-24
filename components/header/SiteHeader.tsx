// components/header/SiteHeader.tsx
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="flex h-16 lg:h-20 items-center justify-between
                     rounded-b-xl bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/30
                     ring-1 ring-white/10 px-3 sm:px-4"
        >
          <div className="flex-shrink-0">
            <Link
              href="/"
              aria-label="Home"
              className="flex items-center gap-2"
            >
              <span className="inline-block h-8 w-8 rounded bg-white/90" />
              <span className="hidden sm:inline text-white/90 font-semibold tracking-wide">
                TRAVELO
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            <a
              href="#destinations"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              Destinations
            </a>
            <a
              href="#trip-builder"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              Trip Builder
            </a>
            <a
              href="#how-it-works"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              How It Works
            </a>
            <a
              href="#proof"
              className="text-base text-white/90 hover:text-white transition-opacity"
            >
              Proof
            </a>
          </nav>

          <div className="sm:ml-auto lg:flex items-center gap-6">
            <a
              href="#invoice"
              className="hidden lg:inline text-base text-white/90 hover:text-white transition-opacity"
            >
              Pay Invoice
            </a>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex p-2 ml-1 text-white rounded-md sm:ml-4 lg:hidden hover:bg-white/10 focus:bg-white/10"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
