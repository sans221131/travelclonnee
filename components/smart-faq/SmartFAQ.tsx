"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";

/* --------------------------------------------------------------------------
 * Smart FAQ — two-pane layout
 * - Sticky left "Dock": search, chips, utilities
 * - Right "Results": Best Answer hero + accordion list
 * - Dark, glassy, subtle grid texture, accent edge; no animated bg
 * - URL sync with { scroll:false }, keyboard nav, JSON-LD
 * -------------------------------------------------------------------------- */

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  synonyms?: string[];
  cta?: { label: string; href: string };
  related?: string[];
};

const FAQS: FAQItem[] = [
  {
    id: "quotation-flow",
    question: "How does the booking/quotation flow work?",
    answer:
      "You submit your trip details; our team calls to refine the plan; we send a formal quotation with an invoice reference.",
    tags: ["booking", "quotes"],
    synonyms: [
      "how do i book",
      "pricing process",
      "get a quote",
      "quotation process",
    ],
  },
  {
    id: "what-is-trip-builder-lite",
    question: "What is Trip Builder Lite?",
    answer:
      "A guided, one-question-at-a-time flow inspired by Typeform. It collects your route, dates, travellers, preferences and hands the request to our team.",
    tags: ["trip builder"],
    synonyms: ["smart trip form", "builder", "typeform flow"],
    cta: { label: "Start Trip Builder", href: "#trip-builder" },
  },
  {
    id: "pay-invoice",
    question: "How do I pay an invoice?",
    answer:
      "Use the Have an Invoice section and enter your reference number. You’ll be redirected to our payment gateway.",
    tags: ["payments", "invoices"],
    synonyms: ["pay bill", "payment link", "settle invoice"],
    cta: { label: "Pay invoice", href: "#invoice-pay" },
  },
];

/* ---------------- helpers ---------------- */
const norm = (s: string) => s.toLowerCase().normalize("NFKD");
const tokenize = (s: string) =>
  norm(s)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

function editDistance(a: string, b: string) {
  a = norm(a);
  b = norm(b);
  const m = a.length,
    n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function scoreItem(q: string, item: FAQItem) {
  if (!q.trim()) return 0.0001;
  const qn = norm(q);
  const qTokens = tokenize(q);
  const title = norm(item.question);
  const ans = norm(item.answer);
  const tags = item.tags.map(norm);
  const syns = (item.synonyms || []).map(norm);
  let score = 0;

  if (title.includes(qn)) score += 18;
  if (ans.includes(qn)) score += 6;

  for (const qt of qTokens) {
    if (qt.length < 2) continue;
    if (title.split(/\s+/).includes(qt)) score += 10;
    if (title.includes(qt)) score += 6;
    if (tags.some((t) => t.includes(qt))) score += 7;
    if (syns.some((s) => s.includes(qt))) score += 6;
    if (ans.includes(qt)) score += 3;

    const cands = [
      ...title.split(/\s+/),
      ...syns.flatMap((s) => s.split(/\s+/)),
      ...tags,
    ];
    let best = Infinity;
    for (const c of cands) best = Math.min(best, editDistance(qt, c));
    if (best <= 1 && qt.length >= 4) score += 5;
    else if (best === 2 && qt.length >= 5) score += 3;
  }
  score += Math.min(item.answer.length, 200) / 200;
  return score;
}

function clsx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

/* ---------------- component ---------------- */
export default function SmartFAQ() {
  const router = useRouter();
  const pathname = usePathname();

  const allTags = useMemo(() => {
    const s = new Set<string>();
    FAQS.forEach((f) => f.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef<HTMLInputElement>(null);
  const lastToggledId = useRef<string | null>(null);

  /* Parse URL once */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("q") || "";
    const t = (sp.get("tags") || "").split(",").filter(Boolean);
    const ex = new Set((sp.get("expanded") || "").split(",").filter(Boolean));
    setQuery(q);
    setSelectedTags(t);
    setExpanded(ex);

    const hash = window.location.hash.replace(/^#\/?/, "");
    if (hash.startsWith("faq/")) {
      const id = hash.slice(4);
      if (id) setExpanded((prev) => new Set(prev).add(id));
    }
  }, []);

  /* Sync URL AFTER render, without scrolling to top */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (selectedTags.length) sp.set("tags", selectedTags.join(","));
    if (expanded.size) sp.set("expanded", Array.from(expanded).join(","));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [query, selectedTags, expanded, router, pathname]);

  /* Deep-link hash update after commit, no scroll jump */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = lastToggledId.current;
    if (!id) return;
    const open = expanded.has(id);
    const sp = new URLSearchParams(window.location.search);
    const url = `${pathname}?${sp.toString()}${open ? `#faq/${id}` : ""}`;
    history.replaceState(null, "", url);
  }, [expanded, pathname]);

  // Mutators — no router calls here
  const toggleTag = useCallback((t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }, []);

  const removeTag = useCallback((t: string) => {
    setSelectedTags((prev) => prev.filter((x) => x !== t));
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setSelectedTags([]);
    setExpanded(new Set());
    setActiveIndex(-1);
    searchRef.current?.focus();
  }, []);

  const setAllExpanded = useCallback((open: boolean, ids: string[]) => {
    setExpanded(new Set<string>(open ? ids : []));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      lastToggledId.current = id;
      return next;
    });
  }, []);

  /* Search + ranking */
  const ranked = useMemo(() => {
    const byTags = selectedTags.length
      ? FAQS.filter((f) => selectedTags.every((t) => f.tags.includes(t)))
      : FAQS;

    const withScores = byTags.map((f) => ({
      item: f,
      score: scoreItem(query, f),
    }));
    withScores.sort(
      (a, b) =>
        b.score - a.score || a.item.question.localeCompare(b.item.question)
    );

    const best = withScores[0];
    const second = withScores[1];
    const bestAnswerId =
      best &&
      ((second ? best.score - second.score > 10 : best.score > 18) ||
        norm(best.item.question) === norm(query))
        ? best.item.id
        : null;

    return { bestAnswerId, results: withScores.map((x) => x.item) };
  }, [query, selectedTags]);

  const visibleIds = useMemo(
    () => ranked.results.map((r) => r.id),
    [ranked.results]
  );

  /* Keyboard nav */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.getAttribute("contenteditable") === "true");

      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        clearAll();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const max = ranked.results.length - 1;
          if (max < 0) return -1;
          const next =
            e.key === "ArrowDown"
              ? Math.min(max, prev + 1)
              : Math.max(0, prev - 1);
          const id = ranked.results[next]?.id;
          document
            .getElementById(`faq-item-${id}`)
            ?.scrollIntoView({ block: "nearest" });
          return next;
        });
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const id = ranked.results[activeIndex]?.id;
        if (id) toggleExpand(id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ranked.results, activeIndex, toggleExpand, clearAll]);

  /* JSON-LD */
  const jsonLd = useMemo(() => {
    const mainEntity = ranked.results.slice(0, 6).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    }));
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity,
    } as const;
  }, [ranked.results]);

  return (
    <section className="relative w-full bg-transparent text-white/90">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs tracking-[0.25em] text-white/50 uppercase">
            Answers, on tap
          </p>
          <h2 className="mt-2 text-6xl font-semibold tracking-tight text-white">
            Smart FAQ
          </h2>
          <p className="mt-3 text-base sm:text-xl lg:text-2xl text-white/70">
            Search, filter, deep link. Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/80">
              /
            </kbd>{" "}
            to focus search.
          </p>
        </header>

        {/* Two-pane layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Dock (left) */}
          <aside className="lg:col-span-4" aria-label="FAQ filters and tools">
            <div className="dockPanel sticky top-[calc(var(--header-h,72px)+16px)]">
              <div className="panel accentEdge rounded-2xl overflow-hidden">
                {/* Search */}
                <div className="border-b border-white/10 p-3 sm:p-4">
                  <label htmlFor="faq-search" className="sr-only">
                    Search questions
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <div
                      className="i-lucide-search h-4 w-4 opacity-60"
                      aria-hidden
                    />
                    <input
                      id="faq-search"
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full bg-transparent outline-none placeholder-white/40 text-sm sm:text-base"
                    />
                    <kbd className="hidden sm:block text-[11px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                      /
                    </kbd>
                  </div>

                  {/* Active filters */}
                  {(selectedTags.length > 0 || query) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {query && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs">
                          <span className="text-white/70">Query:</span>
                          <span className="text-white">{query}</span>
                          <button
                            type="button"
                            className="opacity-70 hover:opacity-100"
                            aria-label="Clear search"
                            onClick={() => setQuery("")}
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {selectedTags.map((t) => (
                        <span
                          key={`sel-${t}`}
                          className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs"
                        >
                          <span className="text-white">{t}</span>
                          <button
                            type="button"
                            className="opacity-70 hover:opacity-100"
                            aria-label={`Remove ${t}`}
                            onClick={() => removeTag(t)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={clearAll}
                        className="ml-auto text-xs rounded-md px-2.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="p-3 sm:p-4">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-white/50">
                    Filter by tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((t) => {
                      const on = selectedTags.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTag(t)}
                          className={clsx(
                            "shrink-0 text-xs sm:text-sm rounded-full px-3 py-1.5 border transition",
                            on
                              ? "bg-white text-black border-white"
                              : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                          )}
                          aria-pressed={on}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Utilities */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllExpanded(true, visibleIds)}
                      className="text-xs rounded-md px-2.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10"
                    >
                      Expand all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllExpanded(false, visibleIds)}
                      className="text-xs rounded-md px-2.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10"
                    >
                      Collapse all
                    </button>
                  </div>
                </div>
              </div>

              {/* Count card */}
              <div className="mt-4 panel rounded-xl px-4 py-3 text-sm text-white/70">
                <span className="text-white">{ranked.results.length}</span>{" "}
                result
                {ranked.results.length === 1 ? "" : "s"} found
              </div>
            </div>
          </aside>

          {/* Results (right) */}
          <main className="lg:col-span-8">
            {/* Best Answer hero */}
            {ranked.bestAnswerId && (
              <BestAnswerHero
                item={FAQS.find((f) => f.id === ranked.bestAnswerId)!}
                onToggle={() => toggleExpand(ranked.bestAnswerId!)}
                expanded={expanded.has(ranked.bestAnswerId)}
              />
            )}

            {/* List */}
            <div className="space-y-3">
              {ranked.results.map((f, i) => (
                <FAQRow
                  key={f.id}
                  index={i}
                  item={f}
                  active={i === activeIndex}
                  expanded={expanded.has(f.id)}
                  onToggle={() => toggleExpand(f.id)}
                />
              ))}

              {ranked.results.length === 0 && <EmptyState onReset={clearAll} />}
            </div>
          </main>
        </div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Panels + accent edge + subtle grid texture */}
      <style jsx>{`
        .dockPanel {
          /* wrapper so sticky looks good on tall pages */
        }

        .panel {
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(
              to bottom right,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.03)
            )
            border-box;
          backdrop-filter: blur(14px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06),
            0 8px 30px rgba(0, 0, 0, 0.35);
        }
        /* subtle grid texture */
        .panel::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            );
          background-size: 24px 24px;
          pointer-events: none;
          mask: linear-gradient(#000, #000);
        }
        /* accent edge on the left side */
        .accentEdge {
          overflow: hidden;
        }
        .accentEdge::before {
          content: "";
          position: absolute;
          inset: 0 0 0 auto;
          width: 4px;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.12)
          );
          opacity: 0.6;
        }
        @media (prefers-color-scheme: light) {
          .panel {
            border-color: rgba(0, 0, 0, 0.1);
          }
          .panel::after {
            background-image: linear-gradient(
                to right,
                rgba(0, 0, 0, 0.04) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 1px,
                transparent 1px
              );
          }
          .accentEdge::before {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}

/* ---------- subviews ---------- */

function BestAnswerHero({
  item,
  onToggle,
  expanded,
}: {
  item: FAQItem;
  onToggle: () => void;
  expanded: boolean;
}) {
  return (
    <article className="mb-4 rounded-2xl overflow-hidden panel">
      <div className="relative p-4 sm:p-5">
        {/* ribbon */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" />
          <span className="text-xs tracking-wide text-amber-100/90 uppercase">
            Best answer
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            {item.question}
          </h3>
          <button
            type="button"
            className="text-xs rounded-md px-2.5 py-1.5 bg-amber-200/20 hover:bg-amber-200/30 border border-amber-200/30"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>

        <div
          className={clsx(
            "grid transition-[grid-template-rows,opacity] duration-150 ease-out",
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-80"
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-2 text-sm sm:text-[15px] leading-6 text-white/80">
              {item.answer}
            </p>
            <div className="mt-3">
              {item.cta && (
                <a
                  href={item.cta.href}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
                >
                  {item.cta.label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function FAQRow({
  item,
  expanded,
  onToggle,
  active,
  index,
  compact = false,
  showBadge = true,
}: {
  item: FAQItem;
  expanded: boolean;
  onToggle: () => void;
  active?: boolean;
  index: number;
  compact?: boolean;
  showBadge?: boolean;
}) {
  const id = `faq-item-${item.id}`;
  const rowBg = index % 2 === 0 ? "bg-white/[0.045]" : "bg-white/[0.065]";

  const onRelatedClick = (rid: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(`faq-item-${rid}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article
      id={id}
      data-faq-row
      className={clsx(
        "rounded-2xl border border-white/10 panel",
        rowBg,
        active && "ring-2 ring-white/30"
      )}
    >
      <header className="px-3 sm:px-4 py-3">
        {showBadge && (
          <div className="mb-2 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] text-white/50">
            {item.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/40" />
                {t}
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={`${id}-panel`}
          className="group w-full flex items-start justify-between gap-3 text-left"
        >
          <h3
            className={clsx(
              "text-base sm:text-lg font-semibold text-white",
              compact && "text-base"
            )}
          >
            {item.question}
          </h3>
          <span
            className={clsx(
              "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-transform",
              expanded ? "rotate-180" : "rotate-0"
            )}
            aria-hidden
          >
            ▾
          </span>
        </button>

        <div
          id={`${id}-panel`}
          className={clsx(
            "grid transition-[grid-template-rows,opacity] duration-150 ease-out",
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-70"
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-2 text-sm sm:text-[15px] leading-6 text-white/75">
              {item.answer}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {item.cta && (
                <a
                  href={item.cta.href}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
                >
                  {item.cta.label}
                </a>
              )}
              {item.related && item.related.length > 0 && (
                <div className="text-xs text-white/50">
                  Related:{" "}
                  {item.related
                    .map((rid) => (
                      <a
                        key={rid}
                        href={`#faq/${rid}`}
                        onClick={onRelatedClick(rid)}
                        className="underline decoration-white/30 underline-offset-2 hover:text-white/70"
                      >
                        {rid.replace(/-/g, " ")}
                      </a>
                    ))
                    .reduce(
                      (acc: React.ReactNode[], curr, i) =>
                        i
                          ? [...acc, <span key={`sep-${i}`}> · </span>, curr]
                          : [curr],
                      [] as React.ReactNode[]
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </article>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl panel px-4 py-8 text-center text-white/70">
      <p className="text-sm">
        No results. Try <span className="text-white">“invoice”</span>,{" "}
        <span className="text-white">“visa”</span>, or{" "}
        <span className="text-white">“Trip Builder”</span>.
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
        onClick={onReset}
      >
        Clear filters
      </button>
    </div>
  );
}
