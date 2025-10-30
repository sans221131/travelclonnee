export const runtime = "nodejs";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToTripButton from "@/components/activities/AddToTripButton";
import { getActivityById } from "@/lib/db";

/* ----------------- helpers ----------------- */

/** DB stores literal "\\n". Convert and tidy. */
function sanitizeDescription(raw?: string) {
  if (!raw) return "";
  let cleaned = raw.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\s+\n/g, "\n").trim();
  return cleaned;
}

/** Detect SHOUTY headings. */
function isHeadingLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^[-•*]\s+/.test(trimmed)) return false;
  if (trimmed.length > 100) return false;

  const lettersOnly = trimmed.replace(/[0-9\-–—.;:,()'"\s/]/g, "");
  if (!/[A-Za-z]/.test(lettersOnly)) return false;

  const isMostlyUpper =
    lettersOnly === lettersOnly.toUpperCase() &&
    lettersOnly !== lettersOnly.toLowerCase();

  return isMostlyUpper;
}

/** Nicer section titles. */
function prettyTitle(raw?: string) {
  if (!raw || raw.trim() === "") return "About this experience";

  const map: Record<string, string> = {
    "WHAT’S INCLUDED": "What’s Included",
    "WHAT'S INCLUDED": "What’s Included",
    "WHO IT’S FOR / ELIGIBILITY": "Who It’s For",
    "WHO IT'S FOR / ELIGIBILITY": "Who It’s For",
    "WHAT YOU’LL ACTUALLY DO": "What You’ll Do",
    "WHAT YOU'LL ACTUALLY DO": "What You’ll Do",
    "REQUIREMENTS & RULES (IMPORTANT)": "Before You Go",
    "GOOD TO KNOW": "Good To Know",
    "TL;DR": "Why This Is Worth It",
  };

  if (map[raw.trim()]) return map[raw.trim()];
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Turn the description into structured sections. */
function parseSections(raw?: string) {
  const description = sanitizeDescription(raw);
  if (!description) return [];

  const lines = description.split("\n");

  type Section = { title?: string; paragraphs: string[]; bullets: string[] };
  const sections: Section[] = [];
  let current: Section = { title: undefined, paragraphs: [], bullets: [] };

  function pushCurrent() {
    const hasStuff =
      (current.title && current.title.trim() !== "") ||
      current.paragraphs.length > 0 ||
      current.bullets.length > 0;
    if (hasStuff) sections.push(current);
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    if (isHeadingLine(line)) {
      pushCurrent();
      current = { title: prettyTitle(line), paragraphs: [], bullets: [] };
      continue;
    }

    if (/^[-•*]\s+/.test(line)) {
      const bullet = line.replace(/^[-•*]\s+/, "").trim();
      current.bullets.push(bullet);
      continue;
    }

    current.paragraphs.push(line);
  }

  pushCurrent();

  if (sections.length > 0 && (!sections[0].title || sections[0].title === "")) {
    sections[0].title = "About this experience";
  }

  return sections;
}

/** Short hero teaser. */
function getHeroSnippetFromSections(
  sections: ReturnType<typeof parseSections>
) {
  if (!sections.length) return "";
  const firstSec = sections[0];
  let snippet = firstSec.paragraphs[0] || "";
  if (!snippet) return "";
  if (snippet.length > 220) snippet = snippet.slice(0, 220).trim() + "…";
  return snippet;
}

/** Text for rating. */
function getRatingText(reviewCount?: number | null) {
  if (!reviewCount || reviewCount <= 0) return "New activity";
  return `5.0 · ${reviewCount} reviews`;
}

/** INR-style price label. */
function priceLabel(price: unknown, currency?: string | null) {
  if (price == null) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price) : (price as number);
  if (!isFinite(num)) return "Price on request";
  const cur = currency ?? "";
  const val = Intl.NumberFormat("en-IN").format(num);
  return `${cur} ${val}`.trim();
}

/** little UX niceties */
function cleanDestinationLabel(id?: string | null) {
  if (!id) return "destination";
  return id.replace(/-/g, " ");
}
function slugifyTitle(s?: string) {
  if (!s) return "section";
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** pull up to N highlights (prefer "What’s Included", else first bullets) */
function getHighlights(
  sections: ReturnType<typeof parseSections>,
  n = 6
): string[] {
  const prefer = sections.find((s) =>
    (s.title || "").toLowerCase().includes("include")
  );
  const pool = prefer?.bullets?.length
    ? prefer.bullets
    : sections.flatMap((s) => s.bullets);
  return pool.slice(0, n);
}

/* ----------------- page component ----------------- */

export default async function ActivityDetailPage(props: {
  // Next.js 15: params and searchParams are async
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tripId?: string }>;
}) {
  const { id } = await props.params;
  const sp = (await props.searchParams) ?? {};
  const tripId = sp.tripId;

  if (!id) notFound();

  const activity = await getActivityById(id);
  if (!activity) notFound();

  const sections = parseSections(activity.description);
  const heroSnippet = getHeroSnippetFromSections(sections);
  const destinationLabel = cleanDestinationLabel(activity.destinationId);
  const hasPrice = activity.price != null;

  const highlights = getHighlights(sections, 6);
  const needToKnow =
    sections.find((s) =>
      (s.title || "").toLowerCase().includes("before you go")
    ) ||
    sections.find((s) =>
      (s.title || "").toLowerCase().includes("good to know")
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ===========================
          HERO — split glass panel
      ============================ */}
      <header className="relative">
        <div className="relative h-[64vh] w-full overflow-hidden">
          {activity.imageUrl ? (
            <Image
              src={activity.imageUrl}
              alt={activity.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
              <div className="text-center text-zinc-400">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-white/10">
                  <div className="text-[10px] text-zinc-500">No Image</div>
                </div>
                <p>No image available</p>
              </div>
            </div>
          )}

          {/* film + accent edge */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_100%,rgba(24,24,27,0.55),transparent)]" />

          {/* back */}
          <Link
            href={tripId ? `/trip/receipt/${tripId}` : "/"}
            className="absolute left-6 top-6 z-20 rounded-full bg-black/55 p-3 text-white backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-black/70"
            aria-label="Go back"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          {/* glass card */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-6">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/65 p-6 backdrop-blur-md shadow-[0_20px_100px_-20px_rgba(0,0,0,0.8)]">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  {/* left: title + meta */}
                  <div className="max-w-3xl">
                    {/* chips */}
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="capitalize">{destinationLabel}</span>
                      </span>
                      {(activity as any).duration && (
                        <span className="rounded-full bg-white/10 px-3 py-1.5">
                          {(activity as any).duration}
                        </span>
                      )}
                      {(activity as any).meetingPoint && (
                        <span className="rounded-full bg-white/10 px-3 py-1.5">
                          Meet: {(activity as any).meetingPoint}
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                      {activity.name}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-200">
                      <span className="font-medium text-white">
                        {getRatingText(activity.reviewCount)}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-400/50" />
                      <span className="text-white">
                        {priceLabel(activity.price, activity.currency)}
                        {hasPrice && (
                          <span className="ml-2 text-sm font-normal text-zinc-300">
                            per person
                          </span>
                        )}
                      </span>
                    </div>

                    {heroSnippet && (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-200/90">
                        {heroSnippet}
                      </p>
                    )}
                  </div>

                  {/* right: CTA */}
                  <div className="shrink-0">
                    {tripId ? (
                      <AddToTripButton
                        tripRequestId={tripId}
                        activityId={activity.id}
                        activityName={activity.name}
                        activityImageUrl={activity.imageUrl}
                        destinationId={activity.destinationId}
                        price={
                          typeof activity.price === "string"
                            ? parseFloat(activity.price)
                            : activity.price ?? undefined
                        }
                        currency={activity.currency}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/20 transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
                      />
                    ) : (
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/20 transition-all hover:from-blue-700 hover:to-blue-800"
                      >
                        Add to My Trip Plan
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===========================
          BODY — highlights + sections + sidebar
      ============================ */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900" />

        <div className="relative mx-auto max-w-6xl px-6 py-12">
          {/* Highlights grid */}
          {highlights.length > 0 && (
            <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.7)]">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Highlights
              </h3>
              <ul className="grid grid-cols-1 gap-3 text-[15px] leading-relaxed text-zinc-300 sm:grid-cols-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    {/* tiny check icon */}
                    <svg
                      className="mt-1.5 h-4 w-4 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.364 7.364a1 1 0 01-1.414 0L3.293 9.793a1 1 0 011.414-1.414l3.05 3.05 6.657-6.657a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* LEFT: Sections (accordion style) */}
            <section className="space-y-4">
              {sections.length > 0 ? (
                sections.map((section, idx) => {
                  const title = section.title || "About this experience";
                  const id = `sec-${slugifyTitle(title)}`;
                  const hasBullets = section.bullets.length > 0;
                  const hasParas = section.paragraphs.length > 0;

                  return (
                    <details
                      key={idx}
                      id={id}
                      className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-0 shadow-[0_40px_120px_-25px_rgba(0,0,0,0.8)] open:bg-white/[0.1]"
                      open={idx < 2} // open first two by default
                    >
                      <summary className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white">
                        <h2 className="text-base font-semibold">{title}</h2>
                        <svg
                          className="h-4 w-4 transition-transform group-open:rotate-180"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </summary>

                      <div className="px-5 pb-5">
                        {hasParas && (
                          <div className="space-y-4 text-[15px] leading-relaxed text-zinc-300">
                            {section.paragraphs.map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        )}

                        {hasBullets && (
                          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-zinc-300">
                            {section.bullets.map((b, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="mt-[9px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400/80" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </details>
                  );
                })
              ) : (
                <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-zinc-300">
                  <h2 className="mb-2 text-lg font-semibold text-white">
                    About this experience
                  </h2>
                  <p>Details coming soon.</p>
                </article>
              )}
            </section>

            {/* RIGHT: Sticky price dock (sleeker) */}
            <aside className="space-y-6 flex flex-col justify-end">
              <div className="sticky bottom-6 rounded-2xl border border-white/10 bg-zinc-900/70 p-6 text-center shadow-[0_40px_120px_-25px_rgba(0,0,0,0.8)] ring-1 ring-blue-500/10 backdrop-blur">
                <div className="text-[10px] uppercase tracking-wide text-zinc-400">
                  From
                </div>
                <div className="mt-1 text-3xl font-bold text-white">
                  {priceLabel(activity.price, activity.currency)}
                </div>
                {hasPrice && (
                  <div className="text-[11px] text-zinc-400">
                    per person (base entry)
                  </div>
                )}

                <div className="mt-4 text-[11px] text-emerald-300">
                  Instant confirmation
                </div>
                <div className="text-[11px] text-zinc-400">
                  Weekends / holidays fill fast
                </div>

                <div className="mt-5">
                  {tripId ? (
                    <AddToTripButton
                      tripRequestId={tripId}
                      activityId={activity.id}
                      activityName={activity.name}
                      activityImageUrl={activity.imageUrl}
                      destinationId={activity.destinationId}
                      price={
                        typeof activity.price === "string"
                          ? parseFloat(activity.price)
                          : activity.price ?? undefined
                      }
                      currency={activity.currency}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/20 transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
                    />
                  ) : (
                    <Link
                      href="/"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/20 transition-all hover:from-blue-700 hover:to-blue-800"
                    >
                      Add to My Trip Plan
                    </Link>
                  )}
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-zinc-400">
                  We reserve this for you, bundle it in your custom trip quote,
                  and you decide later. No instant payment here.
                </p>
              </div>

              {/* Need to know (replaces old Quick facts) */}
              {needToKnow &&
                (needToKnow.paragraphs.length > 0 ||
                  needToKnow.bullets.length > 0) && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7)]">
                    <h4 className="mb-3 text-sm font-semibold text-white">
                      Need to know
                    </h4>
                    {needToKnow.paragraphs.length > 0 && (
                      <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
                        {needToKnow.paragraphs.slice(0, 2).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}
                    {needToKnow.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                        {needToKnow.bullets.slice(0, 6).map((b, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400/80" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-zinc-950/85 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60 p-3 sm:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="text-sm text-white">
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">
              From
            </div>
            <div className="text-lg font-semibold">
              {priceLabel(activity.price, activity.currency)}
            </div>
          </div>
          <div className="min-w-[44%]">
            {tripId ? (
              <AddToTripButton
                tripRequestId={tripId}
                activityId={activity.id}
                activityName={activity.name}
                activityImageUrl={activity.imageUrl}
                destinationId={activity.destinationId}
                price={
                  typeof activity.price === "string"
                    ? parseFloat(activity.price)
                    : activity.price ?? undefined
                }
                currency={activity.currency}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/20 transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-60"
              />
            ) : (
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-900/30 ring-1 ring-blue-400/20 transition-all hover:from-blue-700 hover:to-blue-800"
              >
                Add
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
