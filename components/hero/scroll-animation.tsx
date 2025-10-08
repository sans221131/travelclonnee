// components/scroll-animation/scroll-animation.tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loadLottieAnimation } from "@/lib/lottie-loader";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollAnimationProps {
  animationPath: string;
  pxPerFrame?: number;
  scrubAmount?: number;
  className?: string;
}

export function ScrollAnimation({
  animationPath,
  pxPerFrame = 24,
  scrubAmount = 1,
  className = "",
}: ScrollAnimationProps) {
  const heroRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!heroRef.current || !containerRef.current) return;

    const hero = heroRef.current;
    const container = containerRef.current;

    // Load Lottie animation
    const anim = loadLottieAnimation({
      container,
      path: animationPath,
    });

    animationRef.current = anim;

    // Wait for animation to load
    anim.addEventListener("DOMLoaded", () => {
      // Go to first frame
      anim.goToAndStop(0, true);

      // Ensure injected SVG fills container (Tailwind can't target child injected by Lottie)
      const svg = container.querySelector("svg");
      if (svg) {
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        (svg as SVGElement).style.display = "block";
      }

      const totalFrames = anim.getDuration(true);
      const driver = { f: 0 };

      // Calculate total scroll distance
      const sceneLenPx = totalFrames * pxPerFrame;

      // Create GSAP timeline with ScrollTrigger
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => "+=" + sceneLenPx,
          scrub: scrubAmount,
          pin: true,
          // markers: true // Uncomment for debugging
        },
      });

      // Animate frame counter
      tl.to(driver, {
        f: totalFrames - 1,
        onUpdate: () => anim.goToAndStop(driver.f, true),
      });
    });

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [animationPath, pxPerFrame, scrubAmount]);

  return (
    <section
      ref={heroRef}
      className={`relative w-full h-[100dvh] md:h-svh overflow-hidden bg-black ${className}`}
    >
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden bg-black"
        aria-hidden="true"
      />
      <style>{`.pin-spacer{background-color:#000!important;}`}</style>
    </section>
  );
}