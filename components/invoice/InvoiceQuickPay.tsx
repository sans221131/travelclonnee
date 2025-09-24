// components/payments/InvoiceQuickPay.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import SectionHeader from "@/components/sections/SectionHeader";

/* ---------------- Config ---------------- */
const REF_REGEX = /\bINV-[A-Z0-9]{5,10}\b/;
const FETCH_LATENCY_MS = 650;

type Invoice = {
  id: string;
  dateISO: string;
  amount: number;
  currency: string;
  billTo: string;
  status: "unpaid" | "paid" | "expired";
};

const MOCK: Record<string, Invoice> = {
  "INV-AX7Q9K": {
    id: "INV-AX7Q9K",
    dateISO: "2025-09-18",
    amount: 2499,
    currency: "AED",
    billTo: "Naeem Ali",
    status: "unpaid",
  },
  "INV-Z9M2Q1": {
    id: "INV-Z9M2Q1",
    dateISO: "2025-08-31",
    amount: 139900,
    currency: "INR",
    billTo: "Leafway Corporate",
    status: "unpaid",
  },
};

async function lookupInvoice(ref: string): Promise<Invoice | null> {
  await new Promise((r) => setTimeout(r, FETCH_LATENCY_MS));
  return MOCK[ref] ?? null;
}

function isUserInUAE(): boolean {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Dubai";
  } catch {
    return false;
  }
}

function money(n: number, ccy: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
    }).format(n);
  } catch {
    return `${ccy} ${n.toLocaleString()}`;
  }
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/* ---------- tiny deterministic barcode generator ---------- */
type Bar =
  | { kind: "single"; h: number; gapTop: number }
  | {
      kind: "double";
      h1: number;
      h2: number;
      innerGap: number;
      gapTop: number;
    };

function seedFrom(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) h = (h ^ str.charCodeAt(i)) * 16777619;
  return h >>> 0;
}
function prng(seed: number) {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 2 ** 32;
  };
}
function buildBars(seedStr: string, rows = 18): Bar[] {
  const rnd = prng(seedFrom(seedStr || "INV-XXXX"));
  const bars: Bar[] = [];
  for (let i = 0; i < rows; i++) {
    const isDouble = rnd() > 0.55;
    const gapTop = 2 + Math.floor(rnd() * 6);
    if (isDouble) {
      const h1 = 2 + Math.floor(rnd() * 3);
      const h2 = 2 + Math.floor(rnd() * 3);
      const innerGap = 2 + Math.floor(rnd() * 3);
      bars.push({ kind: "double", h1, h2, innerGap, gapTop });
    } else {
      const h = 3 + Math.floor(rnd() * 4);
      bars.push({ kind: "single", h, gapTop });
    }
  }
  return bars;
}

/* ------------- Component --------------- */
export default function InvoiceQuickPay() {
  const [refInput, setRefInput] = useState("");
  const [status, setStatus] = useState<
    "idle" | "validating" | "fetching" | "found" | "notfound" | "error"
  >("idle");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const aeUser = useMemo(() => isUserInUAE(), []);
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncer = useRef<number | null>(null);

  /* Prefill from URL or hash */
  useEffect(() => {
    try {
      const sp = new URLSearchParams(location.search);
      const q = sp.get("ref") || location.hash.replace(/^#/, "");
      const m = (q || "").toUpperCase().match(REF_REGEX);
      if (m) {
        setRefInput(m[0]);
        goFetch(m[0]);
      }
    } catch {}
  }, []);

  /* Paste anywhere → capture ref */
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.clipboardData?.getData("text") || "";
      const m = t.toUpperCase().match(REF_REGEX);
      if (!m) return;
      e.preventDefault();
      setRefInput(m[0]);
      toast("Invoice reference detected");
      goFetch(m[0]);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  function toast(t: string) {
    setMsg(t);
    window.setTimeout(() => setMsg(null), 1600);
  }

  function onChangeRef(raw: string) {
    const up = raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    let val = up.startsWith("INV-")
      ? up
      : "INV-" + up.replace(/^INV-?/, "").replace(/^INV/, "");
    setRefInput(val);
    setStatus("validating");
    setStep(1);
    if (debouncer.current) window.clearTimeout(debouncer.current);
    debouncer.current = window.setTimeout(() => goFetch(val), 300) as unknown as number;
  }

  async function goFetch(val: string) {
    if (!REF_REGEX.test(val)) {
      setStatus("idle");
      setInvoice(null);
      setStep(1);
      return;
    }
    setStatus("fetching");
    setInvoice(null);
    setStep(2);
    try {
      const data = await lookupInvoice(val);
      if (!data) {
        setStatus("notfound");
        setInvoice(null);
        setStep(1);
        return;
      }
      setInvoice(data);
      setStatus("found");
      setStep(2);
    } catch {
      setStatus("error");
      setStep(1);
    }
  }

  function openDrawer() {
    if (!invoice) return;
    setDrawer(true);
    setStep(3);
  }

  function closeDrawer() {
    setDrawer(false);
    setStep(invoice ? 2 : 1);
  }

  function beginRazorpay() {
    if (!invoice) return;
    if (!aeUser) return toast("Payments available in UAE only for now.");
    if (!window.Razorpay) return toast("Razorpay will be wired soon.");
  }

  const canPay = invoice && invoice.status === "unpaid";

  // Build a stable pattern for the barcode from the reference or input
  const barcodeBars = useMemo(
    () => buildBars(invoice?.id || refInput || "INV-XXXX", 18),
    [invoice?.id, refInput]
  );

  return (
    <section
      aria-label="Have an invoice"
      className="relative overflow-x-hidden bg-zinc-950 text-zinc-100"
    >
      {/* Gentle top vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(900px_380px_at_50%_-10%,rgba(255,255,255,.07)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-5xl px-2 sm:px-4 md:px-8 py-4 sm:py-14 md:py-20">
        <StepperDark step={step} />

        <div className="text-center px-1 mb-3 sm:mb-0">
          <SectionHeader
            title="Have an Invoice?"
            subtitle="Enter your reference to review and continue to payment."
            align="center"
            tone="light"
          />
        </div>

        {/* GLOW: wider linear glow behind the card */}
        <div className="relative mt-3 sm:mt-8">
          <div className="absolute inset-x-0 -top-6 sm:-top-8 -z-10 h-24 sm:h-32">
            <div className="glowbar mx-auto h-full w-[130%] sm:w-[135%]" />
          </div>

          {/* Dark ticket card */}
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))] backdrop-blur-md shadow-[0_30px_110px_-30px_rgba(0,0,0,.8)]">
            <div className="grid grid-cols-1 md:grid-cols-[112px_1fr]">
              {/* Stub: hidden on mobile, left on md+ */}
              <aside className="hidden md:block relative md:rounded-l-3xl bg-[radial-gradient(120px_60px_at_30%_25%,rgba(255,255,255,.08),transparent_60%),radial-gradient(140px_70px_at_70%_75%,rgba(255,255,255,.08),transparent_60%)] p-4">
                {/* Desktop layout only */}
                <div>
                  {/* REF + value */}
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400">
                      REF
                    </div>
                    <div className="mt-2 text-xs text-zinc-200 break-all">
                      {invoice?.id || refInput || "INV-XXXXX"}
                    </div>
                  </div>

                  {/* Barcode: desktop only */}
                  <div
                    className="mt-4 overflow-hidden rounded bg-zinc-900/60 flex flex-col px-1.5 py-2 h-28 w-12"
                    aria-label="barcode"
                  >
                    {barcodeBars.map((b, i) =>
                      b.kind === "single" ? (
                        <div key={i} style={{ marginTop: b.gapTop }}>
                          <div
                            className="w-full rounded-[1px]"
                            style={{ height: b.h, background: "rgba(255,255,255,0.88)" }}
                          />
                        </div>
                      ) : (
                        <div key={i} style={{ marginTop: b.gapTop }}>
                          <div
                            className="w-full rounded-[1px]"
                            style={{ height: b.h1, background: "rgba(255,255,255,0.88)" }}
                          />
                          <div style={{ height: b.innerGap }} />
                          <div
                            className="w-full rounded-[1px]"
                            style={{ height: b.h2, background: "rgba(255,255,255,0.88)" }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* perforation: vertical on desktop only */}
                <div className="absolute right-0 top-3 bottom-3 w-px bg-zinc-400/40 [mask:repeating-linear-gradient(0deg,#000_0_8px,transparent_8px_16px)]" />
              </aside>

              {/* Content */}
              <div className="p-3 sm:p-6 md:p-7">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400">
                      INVOICE
                    </div>
                    <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-1.5 sm:gap-3 text-[13px] sm:text-sm text-zinc-300">
                      <Meta label="Date" value={invoice ? fmtDate(invoice.dateISO) : "— —"} />
                      <span className="hidden sm:inline h-3 w-px bg-white/10" />
                      <Meta label="Bill to" value={invoice?.billTo || "— —"} />
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-[11px] text-zinc-400">Amount</div>
                    <div className="mt-1 text-lg sm:text-2xl font-semibold tracking-tight text-white">
                      {invoice ? money(invoice.amount, invoice.currency) : "— —"}
                    </div>
                    <div className="mt-1 sm:mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
                      {invoice?.status ? capitalize(invoice.status) : "Preview"}
                    </div>
                  </div>
                </div>

                <div className="my-3 sm:my-5 h-px bg-zinc-500/50 [mask:repeating-linear-gradient(90deg,#000_0_10px,transparent_10px_18px)]" />

                {/* Reference input row */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                  <div className="inline-flex items-center gap-2 text-[11px] sm:text-sm text-zinc-400">
                    Pay using reference
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] sm:text-[12px] text-zinc-200">
                      {invoice?.id || refInput || "INV-XXXXX"}
                    </span>
                  </div>

                  <div className="flex-1" />

                  <div className="flex w-full gap-2 sm:gap-3 md:w-auto">
                    <label htmlFor="invref" className="sr-only">
                      Invoice reference
                    </label>
                    <div className="relative flex-1 md:flex-none md:w-80">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300">
                        INV
                      </span>
                      <input
                        id="invref"
                        ref={inputRef}
                        inputMode="text"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={15}
                        value={refInput}
                        onChange={(e) => onChangeRef(e.target.value)}
                        placeholder="INV-AX7Q9K"
                        className="h-10 sm:h-11 w-full rounded-full border border-white/10 bg-zinc-900/70 pl-14 pr-4 text-[13px] sm:text-sm tracking-wider text-white placeholder:text-zinc-500 outline-none focus:border-white/30"
                        aria-describedby="refHelp"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={openDrawer}
                      disabled={!invoice || status !== "found"}
                      className="h-10 sm:h-11 px-3 sm:px-4 md:w-auto whitespace-nowrap rounded-full bg-white/90 text-sm font-medium text-zinc-950 shadow-sm transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Review →
                    </button>
                  </div>
                </div>

                <p id="refHelp" className="mt-1 text-[10px] sm:text-[11px] text-zinc-500">
                  Tip: paste your reference anywhere. I’ll catch it.
                </p>
              </div>
            </div>

            {/* Drawer */}
            <div
              className={[
                "overflow-hidden rounded-b-2xl sm:rounded-b-3xl border-t border-white/10 bg-zinc-900/50 backdrop-blur",
                drawer ? "max-h-[70vh]" : "max-h-0",
                reduced
                  ? "transition-[max-height] duration-200"
                  : "transition-[max-height] duration-400",
              ].join(" ")}
              aria-hidden={!drawer}
            >
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-zinc-400">Paying</p>
                    <p className="text-base sm:text-lg font-medium tracking-wide">
                      {invoice?.id} · {invoice ? money(invoice.amount, invoice.currency) : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeDark>Test mode</BadgeDark>
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 grid gap-3 sm:gap-4 sm:grid-cols-3">
                  <InfoCardDark
                    title="Status"
                    value={
                      invoice?.status === "unpaid" ? "Unpaid" : invoice?.status || "-"
                    }
                  />
                  <InfoCardDark title="Billed to" value={invoice?.billTo || "-"} />
                  <InfoCardDark title="Date" value={invoice ? fmtDate(invoice.dateISO) : "-"} />
                </div>

                <div className="mt-5 sm:mt-6 flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-4">
                  <MethodsRowDark />
                  <div className="flex gap-3">
                    {canPay && aeUser ? (
                      <button
                        type="button"
                        onClick={beginRazorpay}
                        className="w-full sm:w-auto rounded-full bg-white text-zinc-950 px-5 py-3 sm:py-2.5 text-sm font-medium shadow-sm hover:brightness-95"
                      >
                        Pay with Razorpay
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          toast(aeUser ? "Invoice not ready." : "Outside UAE: request link.")
                        }
                        className="w-full sm:w-auto rounded-full border border-white/10 bg-white/5 px-5 py-3 sm:py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10"
                      >
                        Request Payment Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* toast */}
          <div
            className={[
              "pointer-events-none fixed left-1/2 top-[calc(env(safe-area-inset-top,0px)+18px)] z-50 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1.5 text-xs text-white shadow",
              msg ? "opacity-100" : "opacity-0",
              "transition-opacity duration-200",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            {msg}
          </div>
        </div>
      </div>

      {/* glow animation (tuned for mobile) */}
      <style jsx>{`
        .glowbar {
          filter: blur(32px);
          opacity: 0.95;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.22) 18%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0.22) 82%,
            rgba(255, 255, 255, 0) 100%
          );
          background-repeat: no-repeat;
          background-size: 320% 100%;
          animation: glow-pan 9s linear infinite;
          mix-blend-mode: screen;
        }
        @keyframes glow-pan {
          0% {
            background-position: -60% 0;
          }
          100% {
            background-position: 160% 0;
          }
        }
        @media (max-width: 640px) {
          .glowbar {
            filter: blur(20px);
            opacity: 0.75;
            animation-duration: 12s;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .glowbar {
            animation: none;
            opacity: 0.4;
          }
        }
      `}</style>
    </section>
  );
}

/* --------- Presentational bits ---------- */
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
        {label}
      </span>
      <span className="text-[13px] sm:text-sm text-zinc-100">{value}</span>
    </span>
  );
}

function StatusDark({
  status,
}: {
  status: "idle" | "validating" | "fetching" | "found" | "notfound" | "error";
}) {
  if (status === "fetching") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
      </div>
    );
  }
  if (status === "notfound")
    return <p className="text-sm text-rose-400/90">No invoice with that reference.</p>;
  if (status === "error")
    return <p className="text-sm text-rose-400/90">Something broke. Try again.</p>;
  if (status === "found") return <p className="text-sm text-emerald-300/90">Invoice found.</p>;
  return <span aria-hidden className="text-sm text-zinc-500"> </span>;
}

function StepperDark({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { id: 1, label: "Reference" },
    { id: 2, label: "Review" },
    { id: 3, label: "Pay" },
  ] as const;
  return (
    <div className="mx-auto mb-4 sm:mb-5 flex max-w-md items-center justify-center gap-4 sm:gap-5 text-xs">
      {items.map((it, i) => (
        <div key={it.id} className="flex items-center gap-1.5">
          <span
            className={[
              "grid h-5 w-5 place-items-center rounded-full border text-[10px]",
              step >= it.id
                ? "border-white bg-white text-zinc-900"
                : "border-white/20 bg-white/5 text-zinc-400",
            ].join(" ")}
            aria-current={step === it.id ? "step" : undefined}
          >
            {it.id}
          </span>
          <span className={step >= it.id ? "text-zinc-200" : "text-zinc-500"}>
            {it.label}
          </span>
          {i < items.length - 1 && <i className="mx-1 block h-px w-6 bg-white/15" />}
        </div>
      ))}
    </div>
  );
}

function BadgeDark({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-200">
      {children}
    </span>
  );
}

function InfoCardDark({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] text-zinc-400">{title}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  );
}

function MethodsRowDark() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-400">
      <span className="text-zinc-500">Methods:</span>
      <i className="inline-flex h-7 w-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[10px] text-zinc-200">
        UPI
      </i>
      <svg
        width="36"
        height="28"
        viewBox="0 0 36 24"
        className="rounded-md border border-white/10 bg-white/5"
      >
        <rect x="1" y="1" width="34" height="22" rx="3" fill="rgba(255,255,255,0.05)" />
        <rect x="6" y="7" width="24" height="10" rx="2" fill="rgba(255,255,255,0.2)" />
      </svg>
      <i className="inline-flex h-7 items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 text-[10px] text-zinc-200">
        NetBanking
      </i>
    </div>
  );
}

/* ------------- Utilities --------------- */
function useReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefers(m.matches);
    update();
    m.addEventListener?.("change", update);
    return () => m.removeEventListener?.("change", update);
  }, []);
  return prefers;
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00Z");
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
