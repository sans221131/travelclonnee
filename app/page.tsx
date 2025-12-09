
// app/page.tsx
import React from "react";
import SiteHeader from "@/components/header/SiteHeader";
import { ScrollAnimation } from "@/components/hero/scroll-animation";

// Use the actual, case-correct path for your file:
import Carousel from "@/components/sections/carousel";

// This component must be either server-safe (no onSubmit) or a Client Component ("use client")
import MonochromeCTASection from "@/components/footer";

// Client component (provided earlier)
import InvoiceQuickPay from "@/components/invoice/InvoiceQuickPay";

// Import client components directly.
import RunwayBands from "@/components/how-it-works/DigitalDockingDivs";

// NEW: Smart FAQ (client)
import SmartFAQ from "@/components/smart-faq/SmartFAQ";

type SectionProps = {
  id: string;
  bg: string;
  text: "light" | "dark";
  children?: React.ReactNode;
};

function FullScreenSection({ id, bg, text, children }: SectionProps) {
  const textClass = text === "light" ? "text-white" : "text-black";
  return (
    <section
      id={id}
      className={`${bg} ${textClass} relative w-full h-[100svh] scroll-mt-24 lg:scroll-mt-28`}
      aria-label={id}
    >
      <div className="absolute inset-0">
        <div className="mx-auto max-w-6xl h-full px-4 md:px-6 py-10">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-black">
        <ScrollAnimation
        animationPath="/animations/data.json"
        pxPerFrame={24}
        scrubAmount={1}
      />

        {/* Section 2: Spotlight Carousel */}
        <Carousel
          id="destinations"
          title="Choose Your Destination"
          items={[
            {
              id: "bali",
              image: "/countries/bali.jpg",
              title: "Bali",
              subtitle: "Tropical Paradise",
            },
            {
              id: "united-states",
              image: "/countries/united-states.jpg",
              title: "United States",
              subtitle: "Diversity & Adventure",
            },
            {
              id: "dubai",
              image: "/countries/dubai.jpg",
              title: "Dubai",
              subtitle: "Luxury & Architecture",
            },
            {
              id: "thailand",
              image: "/countries/thailand.jpg",
              title: "Thailand",
              subtitle: "Beaches & Culture",
            },
            {
              id: "london",
              image: "/countries/london.jpg",
              title: "London",
              subtitle: "History & Charm",
            },
            {
              id: "france",
              image: "/countries/france.jpg",
              title: "France",
              subtitle: "Art & Cuisine",
            },
            {
              id: "japan",
              image: "/countries/japan.jpg",
              title: "Japan",
              subtitle: "Tradition & Modernity",
            },
            {
              id: "turkey",
              image: "/countries/turkey.jpg",
              title: "Türkiye",
              subtitle: "East Meets West",
            },
            {
              id: "china",
              image: "/countries/china.jpg",
              title: "China",
              subtitle: "Ancient & Modern",
            },
            {
              id: "greece",
              image: "/countries/greece.jpg",
              title: "Greece",
              subtitle: "Ancient Wonders",
            },
            {
              id: "germany",
              image: "/countries/germany.webp",
              title: "Germany",
              subtitle: "Culture & Heritage",
            },
            {
              id: "netherlands",
              image: "/countries/netherlands.avif",
              title: "Netherlands",
              subtitle: "Canals & Culture",
            },
            {
              id: "saudi-arabia",
              image: "/countries/saudi.jpg",
              title: "Saudi Arabia",
              subtitle: "Desert & Heritage",
            },
            {
              id: "vietnam",
              image: "/countries/vietnam.webp",
              title: "Vietnam",
              subtitle: "Rich Heritage",
            },
            {
              id: "switzerland",
              image: "/countries/switzerland.jpg",
              title: "Switzerland",
              subtitle: "Alps & Serenity",
            },
            {
              id: "india",
              image: "/countries/india.jpg",
              title: "India",
              subtitle: "Incredible Diversity",
            },
            {
              id: "singapore",
              image: "/countries/singapore.webp",
              title: "Singapore",
              subtitle: "Modern Marvel",
            },
            {
              id: "south-africa",
              image: "/countries/southafrica.jpg",
              title: "South Africa",
              subtitle: "Safari & Coastline",
            },
            {
              id: "australia",
              image: "/countries/australia.webp",
              title: "Australia",
              subtitle: "Reef & Outback",
            },
            {
              id: "new-zealand",
              image: "/countries/newzealand.webp",
              title: "New Zealand",
              subtitle: "Natural Beauty",
            },
          ]}
        />

        {/* View All Destinations Button */}
        <section className="relative bg-zinc-950 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <a
              href="/all-destinations"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-8 py-4 text-base font-medium shadow-lg ring-1 ring-white/20 transition-all hover:bg-white/90 hover:scale-105 active:scale-95"
            >
              <span>View All Destinations</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="mt-4 text-sm text-zinc-400">
              Explore 60+ destinations worldwide
            </p>
          </div>
        </section>

        {/* Section 3: How It Works — GSAP Motion Path */}
        <RunwayBands />

        {/* Section 5: Have an Invoice?  — NOT full screen */}
        {/* Replaces the old FullScreenSection so it isn't 100svh. */}
        <InvoiceQuickPay />

        {/* Section 6: Smart FAQ — not full-screen on purpose */}
        <section id="smart-faq" aria-label="Smart FAQ" className="scroll-mt-28">
          <SmartFAQ />
        </section>

        {/* Footer (not 100vh); let the component own layout + bg */}
        <section id="footer" aria-label="Footer" className="scroll-mt-28">
          <MonochromeCTASection />
        </section>
      </main>
    </>
  );
}
