
// app/page.tsx
import React from "react";
import SiteHeader from "@/components/header/SiteHeader";
import HeroStatic from "@/components/hero/HeroStatic";

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
import TripBuilderLite from "@/components/trip/TripBuilderLite";

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
        {/* Section 1: Animated Hero */}
        <HeroStatic />

        {/* Section 2: Spotlight Carousel */}
        <Carousel
          id="destinations"
          title="Choose Your Destination"
          items={[
            {
              id: "dubai",
              image: "/images/dubai.jpg",
              title: "Dubai",
              subtitle: "Luxury & Architecture",
            },
            {
              id: "thailand",
              image: "/images/thailand.jpg",
              title: "Thailand",
              subtitle: "Beaches & Culture",
            },
            {
              id: "london",
              image: "/images/london.jpg",
              title: "London",
              subtitle: "History & Charm",
            },
            {
              id: "united-states",
              image: "/images/united-states.jpg",
              title: "United States",
              subtitle: "Diversity & Adventure",
            },
            {
              id: "bali",
              image: "/images/bali.jpg",
              title: "Bali",
              subtitle: "Tropical Paradise",
            },
            {
              id: "switzerland",
              image: "/images/switzerland.jpg",
              title: "Switzerland",
              subtitle: "Alps & Serenity",
            },
            {
              id: "paris",
              image: "/images/paris.jpg",
              title: "Paris",
              subtitle: "Romance & Art",
            },
            {
              id: "bhutan",
              image: "/images/bhutan.png",
              title: "Bhutan",
              subtitle: "Himalayan Kingdom",
            },
            {
              id: "maldives",
              image: "/images/maldives.jpg",
              title: "Maldives",
              subtitle: "Crystal Waters",
            },
            {
              id: "kerala",
              image: "/images/kerala.jpg",
              title: "Kerala",
              subtitle: "God's Own Country",
            },
            {
              id: "assam",
              image: "/images/assam.jpg",
              title: "Assam",
              subtitle: "Tea Gardens & Wildlife",
            },
            {
              id: "himachal",
              image: "/images/himachal.jpg",
              title: "Himachal",
              subtitle: "Mountain Retreat",
            },
            {
              id: "meghalaya",
              image: "/images/meghalaya.jpg",
              title: "Meghalaya",
              subtitle: "Abode of Clouds",
            },
            {
              id: "mysore",
              image: "/images/mysore.jpg",
              title: "Mysore",
              subtitle: "Royal Heritage",
            },
            {
              id: "rajasthan",
              image: "/images/rajasthan.jpg",
              title: "Rajasthan",
              subtitle: "Desert Majesty",
            },
            {
              id: "uttarakhand",
              image: "/images/uttarakhand.jpg",
              title: "Uttarakhand",
              subtitle: "Spiritual Heights",
            },
            {
              id: "ladakh",
              image: "/images/ladakh.jpg",
              title: "Ladakh",
              subtitle: "Cold Desert Beauty",
            },
          ]}
        />

        {/* Section 3: How It Works — GSAP Motion Path */}
        <RunwayBands />

        {/* Section 4: Trip Builder Lite */}
        <TripBuilderLite />

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
