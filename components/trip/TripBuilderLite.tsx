// components/trip/TripBuilderLite.tsx
"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

// Pull the same curated choices you use in TripBuilderReceipt
import {
  AIRLINES,
  DESTINATIONS as DESTINATION_CHOICES,
  NATIONALITIES,
  ORIGIN_CITIES,
  HOTEL_PREFERENCES,
  FLIGHT_CLASSES,
  VISA_STATUS,
  DESTINATIONS, // used for label mapping
} from "@/lib/trip-builder/guardrails"

/* ---------------- Types ---------------- */
type Answers = {
  from?: string // "City, Country"
  destination?: string // "City, Country"
  startDate?: string // ISO yyyy-mm-dd
  endDate?: string // ISO yyyy-mm-dd
  adults?: number
  children?: number

  passengerName?: string
  phoneCountryCode?: string // "+91"
  phoneNumber?: string
  email?: string
  nationality?: string
  airlinePref?: string
  hotelPref?: string
  flightClass?: string
  visaStatus?: string

  seededDestination?: string
  seedPromptShown?: boolean
}

type StepId =
  | "fromLocation"
  | "destinationSeed"
  | "destinationSelect"
  | "dates"
  | "travellers"
  | "passengerName"
  | "phoneNumber"
  | "email"
  | "nationality"
  | "airline"
  | "hotel"
  | "flightClass"
  | "visa"
  | "summary"

/* Keep flow identical to TripBuilderReceipt */
const STEPS: StepId[] = [
  "fromLocation",
  "destinationSeed",
  "destinationSelect",
  "dates",
  "travellers",
  "passengerName",
  "phoneNumber",
  "email",
  "nationality",
  "airline",
  "hotel",
  "flightClass",
  "visa",
  "summary",
]

/* ---------------- Helpers ---------------- */
function fmtDate(iso?: string) {
  if (!iso) return ""
  try {
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

// map labels like "Dubai, UAE" or "Dubai" back to canonical label
const DESTINATION_LABEL_TO_ID = DESTINATIONS.reduce<Record<string, string>>((acc, dest) => {
  acc[dest.toLowerCase()] = dest
  const city = dest.split(",")[0].toLowerCase()
  acc[city] = dest
  return acc
}, {})

function destinationSlugFromLabel(label?: string) {
  if (!label) return undefined
  const key = label.toLowerCase().trim()
  if (DESTINATION_LABEL_TO_ID[key]) return DESTINATION_LABEL_TO_ID[key]
  const parts = label.split(",").map((p) => p.trim())
  if (parts.length >= 2) {
    const recomposedKey = `${parts[0].toLowerCase()}, ${parts[1].toLowerCase()}`
    return DESTINATION_LABEL_TO_ID[recomposedKey]
  }
  return undefined
}

/* ---------------- Component ---------------- */
export default function TripBuilderLite() {
  const router = useRouter()

  const [idx, setIdx] = useState(0)
  const [maxVisited, setMaxVisited] = useState(0) // allow pip jump back, not forward
  const [answers, setAnswers] = useState<Answers>({
    adults: 1,
    children: 0,
    // seededDestination: "Dubai, UAE",
    seedPromptShown: false,
    phoneCountryCode: "+91",
  })

  // Determine current step, but skip destinationSeed if nothing is seeded
  const steps = useMemo(() => {
    if (!answers.seededDestination) {
      return STEPS.filter((s) => s !== "destinationSeed")
    }
    return STEPS
  }, [answers.seededDestination])

  const current = steps[idx]

  // submission state
  const [submitting, setSubmitting] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const hasAll = useMemo(() => {
    return Boolean(
      answers.from &&
        (answers.destination || answers.seededDestination) &&
        answers.nationality &&
        answers.startDate &&
        answers.endDate &&
        answers.passengerName?.trim() &&
        (answers.phoneCountryCode || "").trim() &&
        (answers.phoneNumber || "").trim() &&
        (answers.email || "").trim() &&
        answers.airlinePref &&
        answers.hotelPref &&
        answers.flightClass &&
        answers.visaStatus,
    )
  }, [answers])

  // keyboard: arrows for nav, Enter to proceed/submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goPrev()
      } else if (e.key === "Enter") {
        if (current === "summary") {
          if (hasAll) {
            e.preventDefault()
            submitRequest()
          }
        } else if (canProceed()) {
          e.preventDefault()
          goNext()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, idx, answers, hasAll, submitting])

  function canProceed(): boolean {
    switch (current) {
      case "fromLocation":
        return !!answers.from
      case "destinationSeed":
        return true // user will click keep/change buttons
      case "destinationSelect":
        return !!answers.destination
      case "dates":
        return Boolean(answers.startDate && answers.endDate && answers.startDate <= answers.endDate)
      case "travellers":
        return (answers.adults ?? 0) >= 1 && (answers.children ?? 0) >= 0
      case "passengerName":
        return Boolean(answers.passengerName?.trim())
      case "phoneNumber":
        return Boolean(
          (answers.phoneCountryCode || "").trim().length >= 1 &&
            (answers.phoneNumber || "").replace(/\s+/g, "").length >= 6,
        )
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email || "")
      case "nationality":
        return !!answers.nationality
      case "airline":
        return !!answers.airlinePref
      case "hotel":
        return !!answers.hotelPref
      case "flightClass":
        return !!answers.flightClass
      case "visa":
        return !!answers.visaStatus
      case "summary":
        return true
      default:
        return false
    }
  }

  function goNext() {
    if (!canProceed()) return

    // special routing to mirror receipt flow nuances
    if (current === "fromLocation") {
      const next = answers.seededDestination ? "destinationSeed" : "destinationSelect"
      const to = steps.indexOf(next)
      setIdx(to)
      setMaxVisited((v) => Math.max(v, to))
      return
    }
    if (current === "destinationSeed") {
      return
    }
    setIdx((i) => {
      const ni = Math.min(i + 1, steps.length - 1)
      setMaxVisited((v) => Math.max(v, ni))
      return ni
    })
  }

  function goPrev() {
    setIdx((i) => Math.max(i - 1, 0))
  }

  // Allow jumping via pips to any visited step
  function jumpTo(i: number) {
    if (i <= maxVisited) setIdx(i)
  }

  // Focus management - only focus if user is already within the trip builder section
  const questionRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const tripBuilderSection = document.getElementById("trip-builder")
    if (tripBuilderSection) {
      const rect = tripBuilderSection.getBoundingClientRect()
      const isInView = rect.top >= 0 && rect.top < window.innerHeight
      if (isInView && questionRef.current) {
        questionRef.current.focus({ preventScroll: true })
      }
    }
  }, [current])

  // Simple setter without auto-advance
  function setAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }))
  }

  // "Keep seeded destination?" actions
  function keepSeeded() {
    if (!answers.seededDestination) return
    setAnswers((a) => ({
      ...a,
      destination: a.seededDestination,
      seededDestination: undefined,
      seedPromptShown: true,
    }))
    const to = steps.indexOf("dates")
    if (to >= 0) {
      setTimeout(() => {
        setIdx(to)
        setMaxVisited((v) => Math.max(v, to))
      }, 100)
    }
  }
  function changeDestination() {
    setAnswers((a) => ({
      ...a,
      seededDestination: undefined,
      seedPromptShown: true,
    }))
    const to = steps.indexOf("destinationSelect")
    if (to >= 0) {
      setTimeout(() => {
        setIdx(to)
        setMaxVisited((v) => Math.max(v, to))
      }, 100)
    }
  }

  async function submitRequest() {
    if (!hasAll || submitting === "saving") return

    setSubmitting("saving")

    const payload = {
      origin: answers.from!,
      destination: answers.destination || answers.seededDestination || "",
      nationality: answers.nationality!,
      startDate: answers.startDate!,
      endDate: answers.endDate!,
      adults: answers.adults ?? 1,
      kids: answers.children ?? 0,
      airlinePreference: answers.airlinePref!,
      hotelPreference: answers.hotelPref!,
      flightClass: answers.flightClass!,
      visaStatus: answers.visaStatus!,
      passengerName: answers.passengerName!,
      email: answers.email!,
      phoneCountryCode: answers.phoneCountryCode!,
      phoneNumber: answers.phoneNumber!,
    }

    try {
      const res = await fetch("/api/trip-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json().catch(() => null)
      const createdId = json && typeof json === "object" ? ((json as { id?: string }).id ?? null) : null

      setSubmitting("saved")

      const params = new URLSearchParams()
      const destId = destinationSlugFromLabel(payload.destination)
      if (destId) params.set("destinationId", destId)

      if (createdId) {
        router.push(`/trip/receipt/${createdId}${params.size ? `?${params}` : ""}`)
      } else {
        router.push(`/trip/receipt${params.size ? `?${params}` : ""}`)
      }
    } catch {
      setSubmitting("error")
    }
  }

  // Basic swipe navigation for mobile
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX
    touchEndX.current = null
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX
  }
  function onTouchEnd() {
    if (touchStartX.current == null || touchEndX.current == null) return
    const dx = touchEndX.current - touchStartX.current
    if (Math.abs(dx) > 48) {
      if (dx > 0) goPrev()
      else if (canProceed()) goNext()
    }
  }

  return (
    <section
      id="trip-builder"
      aria-labelledby="tripbuilder-heading"
      className="relative isolate w-full bg-zinc-950 text-zinc-100 overflow-x-hidden"
      // dvh avoids iOS URL bar jump; safe-area padding improves tap targets
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)",
      }}
    >
      {/* Vignette + linear glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_500px_at_20%_-10%,rgba(255,255,255,0.08)_0%,transparent_60%)]"
      />
      <div className="absolute inset-x-0 top-1/2 -z-10 h-32 overflow-hidden pointer-events-none">
        <div className="glowbar mx-auto h-32 w-[135%]" />
      </div>

      <div className="w-full max-w-none px-4 pt-4 pb-[88px] sm:px-4 sm:pt-12 md:pt-16 md:max-w-2xl lg:max-w-4xl md:mx-auto">
        <h2
          id="tripbuilder-heading"
          className="mb-4 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-6xl sm:mb-8"
        >
          Trip Builder Lite
        </h2>

        <div className="relative w-full rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950/60 to-zinc-900/60 p-0.5 backdrop-blur">
          <div className="relative rounded-xl sm:rounded-2xl bg-zinc-950/60 p-3 sm:p-4 md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-white/10 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_0_40px_2px_rgba(180,180,255,0.08)_inset]"
            />

            {/* Progress (clickable for visited steps) */}
            <ProgressPips total={steps.length} index={idx} onJump={jumpTo} maxVisited={maxVisited} />

            <div className="mx-auto mt-3 w-full sm:max-w-md md:max-w-lg lg:max-w-2xl sm:mt-4 md:mt-6">
              <div
                ref={questionRef}
                tabIndex={-1}
                aria-live="polite"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className={[
                  "relative rounded-lg sm:rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 md:p-5",
                  "overflow-visible sm:overflow-y-auto hide-scrollbar overscroll-contain",
                  "pb-4 sm:pb-6 question-frame",
                ].join(" ")}
              >
                <div className="grid w-full gap-3 sm:gap-4 md:gap-6">
                  {current === "fromLocation" && (
                    <StepShell title="Where are you traveling from?" subtitle="Major cities with airports">
                      <ChoiceGrid options={ORIGIN_CITIES} value={answers.from} onChange={(v) => setAnswer("from", v)} />
                    </StepShell>
                  )}

                  {current === "destinationSeed" && answers.seededDestination && (
                    <StepShell
                      title={`Keep ${answers.seededDestination} as your destination?`}
                      subtitle="You can change it if needed"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <button
                          type="button"
                          className="btn-primary min-h-[44px] touch-manipulation"
                          onClick={keepSeeded}
                        >
                          Keep {answers.seededDestination}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary min-h-[44px] touch-manipulation"
                          onClick={changeDestination}
                        >
                          Change destination
                        </button>
                      </div>
                    </StepShell>
                  )}

                  {current === "destinationSelect" && (
                    <StepShell title="Pick a destination" subtitle="We’ll refine specifics after you submit">
                      <ChoiceGrid
                        options={DESTINATION_CHOICES}
                        value={answers.destination}
                        onChange={(v) => setAnswer("destination", v)}
                      />
                    </StepShell>
                  )}

                  {current === "dates" && (
                    <StepShell title="When do you plan to travel?" subtitle="Select your start and end dates">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <Labeled field="start-date" label="Start date">
                          <input
                            id="start-date"
                            type="date"
                            value={answers.startDate ?? ""}
                            max={answers.endDate || undefined}
                            onChange={(e) => {
                              const newStartDate = e.target.value
                              setAnswers((a) => ({
                                ...a,
                                startDate: newStartDate,
                              }))
                            }}
                            className="input"
                          />
                        </Labeled>
                        <Labeled field="end-date" label="End date">
                          <input
                            id="end-date"
                            type="date"
                            value={answers.endDate ?? ""}
                            min={answers.startDate || undefined}
                            onChange={(e) => {
                              const newEndDate = e.target.value
                              setAnswers((a) => ({
                                ...a,
                                endDate: newEndDate,
                              }))
                            }}
                            className="input"
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "travellers" && (
                    <StepShell title="How many travelers?" subtitle="At least one adult is required">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <Labeled field="adults" label="Adults">
                          <NumberField
                            id="adults"
                            min={1}
                            value={answers.adults ?? 1}
                            onChange={(n) => {
                              setAnswers((a) => ({ ...a, adults: n }))
                            }}
                          />
                        </Labeled>
                        <Labeled field="children" label="Children">
                          <NumberField
                            id="children"
                            min={0}
                            value={answers.children ?? 0}
                            onChange={(n) => {
                              setAnswers((a) => ({ ...a, children: n }))
                            }}
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "passengerName" && (
                    <StepShell title="What's the passenger name?">
                      <Labeled field="pname" label="Full name">
                        <input
                          id="pname"
                          type="text"
                          placeholder="Type your name"
                          inputMode="text"
                          autoComplete="name"
                          value={answers.passengerName ?? ""}
                          onChange={(e) => {
                            const newName = e.target.value
                            setAnswers((a) => ({
                              ...a,
                              passengerName: newName,
                            }))
                          }}
                          className="input"
                        />
                      </Labeled>
                    </StepShell>
                  )}

                  {current === "phoneNumber" && (
                    <StepShell title="Best phone number?">
                      <div className="grid grid-cols-[100px_1fr] gap-2 sm:grid-cols-[140px_1fr] sm:gap-3">
                        <Labeled field="pcode" label="Country code">
                          <input
                            id="pcode"
                            type="tel"
                            placeholder="+91"
                            inputMode="tel"
                            value={answers.phoneCountryCode ?? ""}
                            onChange={(e) => {
                              const newCode = e.target.value
                              setAnswers((a) => ({
                                ...a,
                                phoneCountryCode: newCode,
                              }))
                            }}
                            className="input"
                          />
                        </Labeled>
                        <Labeled field="pnum" label="Number">
                          <input
                            id="pnum"
                            type="tel"
                            placeholder="98765 43210"
                            inputMode="tel"
                            autoComplete="tel"
                            value={answers.phoneNumber ?? ""}
                            onChange={(e) => {
                              const newNumber = e.target.value
                              setAnswers((a) => ({
                                ...a,
                                phoneNumber: newNumber,
                              }))
                            }}
                            className="input"
                          />
                        </Labeled>
                      </div>
                    </StepShell>
                  )}

                  {current === "email" && (
                    <StepShell title="Where should we email your itinerary?">
                      <Labeled field="email" label="Email">
                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          inputMode="email"
                          autoComplete="email"
                          value={answers.email ?? ""}
                          onChange={(e) => {
                            const newEmail = e.target.value
                            setAnswers((a) => ({
                              ...a,
                              email: newEmail,
                            }))
                          }}
                          className="input"
                        />
                      </Labeled>
                    </StepShell>
                  )}

                  {current === "nationality" && (
                    <StepShell title="What's your nationality?">
                      <ChoiceGrid
                        options={NATIONALITIES}
                        value={answers.nationality}
                        onChange={(v) => setAnswer("nationality", v)}
                      />
                    </StepShell>
                  )}

                  {current === "airline" && (
                    <StepShell title="Any airline preference?">
                      <ChoiceGrid
                        options={AIRLINES}
                        value={answers.airlinePref}
                        onChange={(v) => setAnswer("airlinePref", v)}
                      />
                    </StepShell>
                  )}

                  {current === "hotel" && (
                    <StepShell title="Hotel preference?">
                      <ChoiceGrid
                        options={[...HOTEL_PREFERENCES, "7 Star"]}
                        value={answers.hotelPref}
                        onChange={(v) => setAnswer("hotelPref", v)}
                      />
                    </StepShell>
                  )}

                  {current === "flightClass" && (
                    <StepShell title="Flight class preference?">
                      <ChoiceGrid
                        options={[...FLIGHT_CLASSES, "Premium Economy"]}
                        value={answers.flightClass}
                        onChange={(v) => setAnswer("flightClass", v)}
                      />
                    </StepShell>
                  )}

                  {current === "visa" && (
                    <StepShell title="Do you have a visa?">
                      <ChoiceGrid
                        options={VISA_STATUS}
                        value={answers.visaStatus}
                        onChange={(v) => setAnswer("visaStatus", v)}
                      />
                    </StepShell>
                  )}

                  {current === "summary" && (
                    <StepShell title="Review and submit">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                          <Row term="From" def={answers.from} />
                          <Row term="To" def={answers.destination || answers.seededDestination} />
                          <Row term="Start" def={fmtDate(answers.startDate)} />
                          <Row term="End" def={fmtDate(answers.endDate)} />
                          <Row term="Adults" def={String(answers.adults ?? 0)} />
                          <Row term="Children" def={String(answers.children ?? 0)} />
                          <Row term="Name" def={answers.passengerName} />
                          <Row
                            term="Phone"
                            def={`${answers.phoneCountryCode ?? ""} ${answers.phoneNumber ?? ""}`.trim()}
                          />
                          <Row term="Email" def={answers.email} />
                          <Row term="Nationality" def={answers.nationality} />
                          <Row term="Airline" def={answers.airlinePref} />
                          <Row term="Hotel" def={answers.hotelPref} />
                          <Row term="Class" def={answers.flightClass} />
                          <Row term="Visa" def={answers.visaStatus} />
                        </dl>
                      </div>
                      <p className="mt-3 text-sm text-zinc-400">
                        {submitting === "saving" && "Submitting…"}
                        {submitting === "saved" && "Redirecting…"}
                        {submitting === "error" && "We couldn’t submit your request. Refresh and try again."}
                      </p>
                    </StepShell>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Nav */}
            <div className="mt-3 sm:mt-6">
              <div className="sticky inset-x-0 bottom-0 z-10 flex w-full items-center justify-between rounded-none border border-white/10 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/40 bg-zinc-900/70 sm:mx-auto sm:bottom-2 sm:w-full sm:rounded-lg sm:px-2.5 sm:py-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={idx === 0 || submitting === "saving"}
                  className="btn-secondary disabled:opacity-40 min-h-[44px] px-3 touch-manipulation text-sm"
                >
                  ← Previous
                </button>

                <div className="text-xs text-zinc-400 px-2">
                  Step {idx + 1} of {steps.length}
                </div>

                {current === "summary" ? (
                  <button
                    type="button"
                    onClick={submitRequest}
                    disabled={!hasAll || submitting === "saving"}
                    className="btn-primary disabled:opacity-40 min-h-[44px] px-3 touch-manipulation text-sm"
                  >
                    {submitting === "saving" ? "Submitting…" : "Submit →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed() || submitting === "saving"}
                    className="btn-primary disabled:opacity-40 min-h-[44px] px-3 touch-manipulation text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS helpers for your dark glass aesthetic */}
      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 0.8rem 1rem;
          font-size: 16px; /* Prevents zoom on iOS */
          outline: none;
          backdrop-filter: blur(6px);
          -webkit-appearance: none;
          appearance: none;
        }
        .input:focus {
          border-color: rgba(255, 255, 255, 0.24);
          box-shadow: 0 0 0 4px rgba(180, 180, 255, 0.12);
        }
        .btn-primary {
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.18),
            rgba(255, 255, 255, 0.06)
          );
          color: white;
          padding: 0.65rem 1.1rem;
          font-size: 16px; /* Prevents zoom on iOS */
          backdrop-filter: blur(6px);
          font-weight: 500;
        }
        .btn-secondary {
          border-radius: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          padding: 0.65rem 1.1rem;
          font-size: 16px; /* Prevents zoom on iOS */
          backdrop-filter: blur(6px);
          font-weight: 500;
        }
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* WebKit */
        }

        /* responsive heights: only constrain on sm and up to avoid nested scroll on mobile */
        .question-frame {
          /* mobile: auto height, no fixed min/max -> single page scroll */
        }
        @media (min-width: 640px) {
          .question-frame {
            min-height: min(45dvh, 350px);
            max-height: min(55dvh, 450px);
          }
        }

        @media (max-width: 640px) {
          .input {
            font-size: 16px;
            padding: 0.75rem 0.9rem;
          }
          .btn-primary,
          .btn-secondary {
            font-size: 14px;
            padding: 0.6rem 1rem;
            font-weight: 600;
          }
        }
      `}</style>
    </section>
  )
}

/* ---------------- Little building blocks ---------------- */
function StepShell(props: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-5">
      <div>
        <h3 className="text-base font-semibold text-white leading-tight sm:text-lg md:text-xl lg:text-2xl">
          {props.title}
        </h3>
        {props.subtitle && <p className="mt-1 text-xs text-zinc-400 sm:text-sm sm:mt-1.5">{props.subtitle}</p>}
      </div>
      <div className="mt-0.5">{props.children}</div>
    </div>
  )
}

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<string>
  value?: string
  onChange: (val: string) => void
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={[
              "group rounded-lg border px-3.5 py-3.5 text-left transition touch-manipulation min-h-[52px] sm:min-h-[56px]",
              "active:scale-[0.99] text-sm sm:text-base",
              active
                ? "border-white/40 bg-white/15 shadow-lg"
                : "border-white/15 bg-white/8 hover:bg-white/12 hover:border-white/25",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm leading-5 text-white font-medium sm:text-base">{opt}</span>
              <span
                className={[
                  "ml-3 inline-flex h-3.5 w-3.5 rounded-full border-2 sm:h-4 sm:w-4",
                  active ? "bg-white border-white" : "bg-transparent border-white/40 group-hover:border-white/60",
                ].join(" ")}
              >
                {active && <span className="m-auto h-1.5 w-1.5 rounded-full bg-zinc-900 sm:h-2 sm:w-2"></span>}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function Labeled({
  field,
  label,
  children,
}: {
  field: string
  label: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={field} className="block">
      <div className="mb-1 text-xs uppercase tracking-wide text-zinc-400">{label}</div>
      {children}
    </label>
  )
}

function NumberField({
  id,
  min = 0,
  value,
  onChange,
}: {
  id: string
  min?: number
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button
        type="button"
        className="btn-secondary px-2.5 py-2 min-w-[40px] min-h-[40px] touch-manipulation sm:px-3"
        onClick={() => onChange(Math.max(min, (value || 0) - 1))}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={min}
        value={value}
        inputMode="numeric"
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="input text-center min-h-[40px]"
        style={{ MozAppearance: "textfield" as any }}
      />
      <button
        type="button"
        className="btn-secondary px-2.5 py-2 min-w-[40px] min-h-[40px] touch-manipulation sm:px-3"
        onClick={() => onChange((value || 0) + 1)}
      >
        +
      </button>
    </div>
  )
}

function Row({ term, def }: { term: string; def?: string | null }) {
  return (
    <div className="rounded-lg bg-white/5 p-3">
      <dt className="text-xs uppercase tracking-wide text-zinc-400">{term}</dt>
      <dd className="mt-1 text-sm text-white">{def || "—"}</dd>
    </div>
  )
}

function ProgressPips({
  total,
  index,
  onJump,
  maxVisited,
}: {
  total: number
  index: number
  onJump: (i: number) => void
  maxVisited: number
}) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const visited = i <= maxVisited
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to step ${i + 1}`}
            onClick={() => visited && onJump(i)}
            className={[
              "h-2 w-7 rounded-full transition sm:h-1.5 sm:w-6",
              i <= index ? "bg-white" : "bg-white/25",
              visited ? "opacity-100" : "opacity-40 cursor-not-allowed",
            ].join(" ")}
          />
        )
      })}
    </div>
  )
}
