"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SectionHeader from "@/components/sections/SectionHeader"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type Step = {
  id: string
  title: string
  body: string
}

type DigitalDockingDivsProps = {
  steps?: Step[]
  heading?: string
  subtitle?: string
}

const DEFAULT_STEPS: Step[] = [
  { id: "plan", title: "Plan", body: "Share your travel dates, destinations, and preferences." },
  { id: "curate", title: "Curate", body: "Within 24–48 hours, we’ll handcraft the perfect itinerary." },
  { id: "confirm", title: "Confirm", body: "Receive your quote, settle the invoice, and lock in your trip." },
  { id: "travel", title: "Travel", body: "Bags packed, memories waiting—your journey begins." },
]

export default function DigitalDockingDivs({
  steps = DEFAULT_STEPS,
  heading = "How It Works",
  subtitle = "This is how we make travel easy for you.",
}: DigitalDockingDivsProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const textRefs = useRef<(HTMLDivElement | null)[]>([])
  const indicatorRefs = useRef<(HTMLDivElement | null)[]>([])
  const pipRefs = useRef<(HTMLSpanElement | null)[]>([])
  const trackRef = useRef<HTMLDivElement | null>(null)
  const trackGlowRef = useRef<HTMLDivElement | null>(null)
  const startLineRef = useRef<HTMLDivElement | null>(null)
  const planeRef = useRef<HTMLDivElement | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  // reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotion = () => setReducedMotion(media.matches)
    updateMotion()
    media.addEventListener("change", updateMotion)
    return () => media.removeEventListener("change", updateMotion)
  }, [])

  // keep ref arrays tight
  useEffect(() => {
    const cap = steps.length
    if (cardRefs.current.length > cap) cardRefs.current.length = cap
    if (textRefs.current.length > cap) textRefs.current.length = cap
    if (indicatorRefs.current.length > cap) indicatorRefs.current.length = cap
  }, [steps.length])

  // animations
  useEffect(() => {
    if (!sectionRef.current || reducedMotion) return

    const ctx = gsap.context(() => {
      // step card entrances
      cardRefs.current.forEach((card, index) => {
        const indicator = indicatorRefs.current[index]
        const text = textRefs.current[index]
        if (!card || !indicator || !text) return

        gsap.set(card, { opacity: 0.2, y: 48 })
        gsap.set(text, { opacity: 0, y: 20 })
        gsap.set(indicator, {
          opacity: 0.45,
          scale: 0.65,
          filter: "brightness(0.6)",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
        })

        gsap
          .timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "top 45%",
              scrub: true,
            },
          })
          .to(indicator, {
            opacity: 1,
            scale: 1,
            filter: "brightness(1.35)",
            boxShadow: "0 0 2.5rem rgba(255,255,255,0.55)",
            duration: 0.6,
          })
          .to(card, { opacity: 1, y: 0, duration: 0.6 }, "<0.1")
          .to(text, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
      })

      // plane + runway glow + pip ignition
      const plane = planeRef.current
      const track = trackRef.current
      const trackGlow = trackGlowRef.current
      const startLine = startLineRef.current

      if (plane && track && trackGlow) {
        // align tops exactly, in case of layout nudge
        const trackRect = track.getBoundingClientRect()
        const planeRect = plane.getBoundingClientRect()
        const yCorrection = Math.round(trackRect.top - planeRect.top)
        gsap.set(plane, { y: yCorrection })

        const travel = () => Math.max(0, track.offsetHeight - plane.offsetHeight)
        const litState: boolean[] = []

        gsap.to(plane, {
          y: () => yCorrection + travel(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: "top 10%",
            end: "bottom 20%",
            scrub: true,
          },
          onUpdate: () => {
            const planeTipY = plane.getBoundingClientRect().top + plane.offsetHeight * 0.5

            // grow the glow overlay to current plane position
            const overlayTop = trackGlow.getBoundingClientRect().top
            const glowHeight = Math.max(0, planeTipY - overlayTop)
            trackGlow.style.height = `${glowHeight}px`

            // start line brief glow when crossed
            if (startLine) {
              const startLineBottom = startLine.getBoundingClientRect().bottom
              const crossed = planeTipY >= startLineBottom + 1
              gsap.to(startLine, {
                boxShadow: crossed
                  ? "0 0 24px rgba(255,255,255,0.55), 0 0 60px rgba(255,255,255,0.25)"
                  : "0 0 0 rgba(0,0,0,0)",
                duration: 0.25,
                overwrite: true,
              })
            }

            // light pips on pass
            pipRefs.current.forEach((pip, i) => {
              if (!pip) return
              const pr = pip.getBoundingClientRect()
              const shouldLight = pr.top <= planeTipY
              if (litState[i] !== shouldLight) {
                litState[i] = shouldLight
                if (shouldLight) {
                  gsap.to(pip, {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    scale: 1.15,
                    filter: "brightness(1.5)",
                    boxShadow: "0 0 18px rgba(255,255,255,0.55)",
                    duration: 0.16,
                  })
                } else {
                  gsap.to(pip, {
                    backgroundColor: "rgba(255,255,255,0.18)",
                    scale: 1,
                    filter: "brightness(1)",
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    duration: 0.16,
                  })
                }
              }
            })
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [steps.length, reducedMotion])

  // reduced-motion fallback
  useEffect(() => {
    if (!reducedMotion) return
    cardRefs.current.forEach((c) => c && ((c.style.opacity = "1"), (c.style.transform = "none")))
    textRefs.current.forEach((t) => t && ((t.style.opacity = "1"), (t.style.transform = "none")))
    const plane = planeRef.current
    const trackGlow = trackGlowRef.current
    if (plane) plane.style.transform = "translateY(0px)"
    if (trackGlow && trackRef.current) {
      trackGlow.style.height = `${trackRef.current.offsetHeight}px`
    }
    pipRefs.current.forEach((pip) => {
      if (!pip) return
      pip.style.backgroundColor = "rgba(255,255,255,0.9)"
      pip.style.boxShadow = "0 0 12px rgba(255,255,255,0.4)"
      pip.style.filter = "brightness(1.35)"
      pip.style.transform = "scale(1.05)"
    })
  }, [reducedMotion, steps.length])

  const pipCount = Math.max(12, steps.length * 4)

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="relative isolate overflow-hidden rounded-3xl border border-border/40 bg-primary px-4 py-16 text-primary-foreground shadow-[0_40px_120px_-60px_rgba(0,0,0,0.6)] sm:px-6 md:px-10"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/40 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-5xl">
        <SectionHeader id="how-it-works-heading" title={heading} subtitle={subtitle} align="center" tone="light" />

        <div className="relative mt-12 md:mt-16">
          {/* BASE TRACK */}
          <div
            aria-hidden
            ref={trackRef}
            className="pointer-events-none absolute inset-y-10 left-6 w-px bg-primary-foreground/25 md:left-1/2 md:-translate-x-1/2"
          />

          {/* GLOW OVERLAY */}
          <div
            aria-hidden
            ref={trackGlowRef}
            className="pointer-events-none absolute left-6 top-10 w-px bg-gradient-to-b from-white via-white/90 to-white/30 md:left-1/2 md:-translate-x-1/2"
            style={{ height: 0, boxShadow: "0 0 24px rgba(255,255,255,0.45)" }}
          />

          {/* START LINE */}
          <div
            aria-hidden
            ref={startLineRef}
            className="pointer-events-none absolute left-[calc(1.5rem-10px)] top-10 h-[2px] w-10 rounded bg-white/80 md:left-[calc(50%-10px)] md:translate-x-[-50%]"
            style={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
          />

          {/* PLANE — shares exact top with track/start line at all breakpoints */}
          <div
            aria-hidden
            ref={planeRef}
            className="pointer-events-none absolute top-10 left-6 hidden w-12 -translate-x-1/2 justify-center md:flex md:top-10 md:left-1/2 md:w-16 lg:w-20"
          >
            <Image
              src="/icons/plane.png"
              alt=""
              width={160}
              height={80}
              className="h-auto w-full drop-shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
              draggable={false}
            />
          </div>

          {/* PIPS COLUMN (desktop) */}
          <div aria-hidden className="pointer-events-none absolute inset-y-14 left-1/2 hidden -translate-x-1/2 md:flex">
            <div className="flex flex-col justify-between">
              {Array.from({ length: pipCount }).map((_, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    pipRefs.current[i] = el
                  }}
                  className="mx-auto block h-1.5 w-1.5 rounded-full bg-white/20"
                />
              ))}
            </div>
          </div>

          {/* STEPS */}
          <ol className="relative flex flex-col gap-10 pl-12 sm:pl-16 md:pl-0 md:gap-20">
            {steps.map((step, index) => {
              const alignRight = index % 2 === 0
              return (
                <li key={step.id} className="relative">
                  <div
                    className={`relative w-full pt-6 text-left md:pt-12 md:w-[min(520px,calc(50%-3.5rem))] ${
                      alignRight ? "md:ml-auto md:pl-16 md:text-right" : "md:mr-auto md:pr-16"
                    }`}
                  >
                    {/* small indicator near each card */}
                    <div
                      ref={(el) => {
                        indicatorRefs.current[index] = el
                      }}
                      className={`absolute top-3 ${
                        alignRight ? "-right-3 md:-right-6" : "-left-3 md:-left-6"
                      } h-3 w-3 rounded-full border border-white/30 bg-white/20 shadow-[0_0_0_rgba(0,0,0,0)] md:top-8`}
                      aria-hidden
                    />

                    <div
                      ref={(el) => {
                        cardRefs.current[index] = el
                      }}
                      className="relative z-10 rounded-2xl border border-primary-foreground/12 bg-background/95 px-5 py-6 text-foreground shadow-[0_30px_90px_-60px_rgba(0,0,0,0.7)] backdrop-blur-lg md:px-6 md:py-8"
                    >
                      <div
                        ref={(el) => {
                          textRefs.current[index] = el
                        }}
                        className={`flex flex-col items-start gap-3 text-left ${
                          alignRight ? "md:items-end md:text-right" : "md:items-start md:text-left"
                        }`}
                      >
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Step {index + 1}
                        </span>
                        <h3 className="text-pretty text-lg font-semibold leading-snug text-foreground sm:text-xl md:text-2xl">
                          <span>{step.title}</span>
                          <span className="font-normal text-muted-foreground">{` — ${step.body}`}</span>
                        </h3>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
