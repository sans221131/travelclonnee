// app/trip/receipt/[id]/page.tsx
export const runtime = "nodejs";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToTripButton from "@/components/activities/AddToTripButton";
import {
  getTripRequest,
  getActivitiesForReceipt,
  getActivitiesByDestinationId,
  type Activity,
} from "../../../../lib/db";

/* ---------------- utils ---------------- */
function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "Unknown date";
  
  try {
    let date: Date;
    if (d instanceof Date) {
      date = d;
    } else if (typeof d === 'string') {
      // If it's already in YYYY-MM-DD format, add time
      if (d.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(d + "T00:00:00");
      } else {
        date = new Date(d);
      }
    } else {
      date = new Date(d);
    }
    
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Convert city names to IATA airport codes
function cityToIATA(cityName: string): string {
  const normalized = cityName.toLowerCase().trim();
  
  const iataMap: Record<string, string> = {
    // Indian cities
    "mumbai": "BOM",
    "mumbai, india": "BOM",
    "bombay": "BOM",
    "delhi": "DEL", 
    "delhi, india": "DEL",
    "new delhi": "DEL",
    "bangalore": "BLR",
    "bangalore, india": "BLR",
    "bengaluru": "BLR",
    "bengaluru, india": "BLR",
    "hyderabad": "HYD",
    "hyderabad, india": "HYD", 
    "chennai": "MAA",
    "chennai, india": "MAA",
    "madras": "MAA",
    "kolkata": "CCU",
    "kolkata, india": "CCU",
    "calcutta": "CCU",
    "pune": "PNQ",
    "pune, india": "PNQ",
    "ahmedabad": "AMD",
    "ahmedabad, india": "AMD",
    "jaipur": "JAI",
    "jaipur, india": "JAI",
    "lucknow": "LKO",
    "lucknow, india": "LKO",
    "kanpur": "KNU",
    "kanpur, india": "KNU",
    "nagpur": "NAG",
    "nagpur, india": "NAG",
    "indore": "IDR",
    "indore, india": "IDR",
    "bhopal": "BHO",
    "bhopal, india": "BHO",
    "visakhapatnam": "VTZ",
    "visakhapatnam, india": "VTZ",
    "patna": "PAT",
    "patna, india": "PAT",
    "vadodara": "BDQ",
    "vadodara, india": "BDQ",
    "ghaziabad": "DEL", // Usually served by Delhi
    "ghaziabad, india": "DEL",
    "ludhiana": "LUH",
    "ludhiana, india": "LUH",
    "agra": "AGR",
    "agra, india": "AGR",
    "nashik": "ISK",
    "nashik, india": "ISK",
    "faridabad": "DEL", // Usually served by Delhi
    "faridabad, india": "DEL",
    "meerut": "DEL", // Usually served by Delhi
    "meerut, india": "DEL",
    "rajkot": "RAJ",
    "rajkot, india": "RAJ",
    "varanasi": "VNS",
    "varanasi, india": "VNS",
    "srinagar": "SXR",
    "srinagar, india": "SXR",
    
    // International destinations
    "dubai": "DXB",
    "dubai, uae": "DXB",
    "london": "LHR",
    "london, uk": "LHR",
    "new york": "JFK",
    "new york, usa": "JFK",
    "singapore": "SIN",
    "singapore, singapore": "SIN",
    "tokyo": "NRT",
    "tokyo, japan": "NRT",
    "bangkok": "BKK",
    "bangkok, thailand": "BKK",
    "bali": "DPS",
    "bali, indonesia": "DPS",
    "denpasar": "DPS",
    "istanbul": "IST",
    "istanbul, turkey": "IST",
    "doha": "DOH",
    "doha, qatar": "DOH",
    "paris": "CDG",
    "paris, france": "CDG",
    "zurich": "ZUR",
    "zurich, switzerland": "ZUR",
    "geneva": "GVA",
    "geneva, switzerland": "GVA",
    
    // Regional/state destinations (using major airport)
    "kerala": "COK", // Kochi
    "kerala, india": "COK",
    "rajasthan": "JAI", // Jaipur
    "rajasthan, india": "JAI", 
    "himachal pradesh": "KUU", // Kullu
    "himachal": "KUU",
    "ladakh": "LEH",
    "ladakh, india": "LEH",
    "uttarakhand": "DED", // Dehradun
    "uttarakhand, india": "DED",
    "assam": "GAU", // Guwahati
    "assam, india": "GAU",
    "meghalaya": "SHL", // Shillong
    "meghalaya, india": "SHL",
    "mysore": "MYQ",
    "mysore, india": "MYQ",
    
    // Country-level mappings
    "thailand": "BKK",
    "united states": "JFK",
    "usa": "JFK", 
    "switzerland": "ZUR",
    "bhutan": "PBH", // Paro
    "maldives": "MLE" // Male
  };

  return iataMap[normalized] || cityName.split(",")[0].substring(0, 3).toUpperCase();
}

// Map destination display names to normalized database destination_ids
function getDestinationId(destination: string): string {
  const normalized = destination.toLowerCase().trim();

  const mappings: Record<string, string> = {
    // Direct mappings to match SQL destination_ids
    "dubai": "dubai",
    "dubai, uae": "dubai",
    "thailand": "thailand", 
    "bangkok": "thailand",
    "bangkok, thailand": "thailand",
    "london": "london",
    "london, uk": "london",
    "united states": "united-states",
    "usa": "united-states",
    "united-states": "united-states",
    "bali": "bali",
    "bali, indonesia": "bali", 
    "switzerland": "switzerland",
    "paris": "paris",
    "paris, france": "paris",
    "bhutan": "bhutan",
    "maldives": "maldives",
    "kerala": "kerala",
    "kerala, india": "kerala",
    "assam": "assam", 
    "assam, india": "assam",
    "himachal pradesh": "himachal",
    "himachal": "himachal",
    "meghalaya": "meghalaya",
    "meghalaya, india": "meghalaya",
    "mysore": "mysore",
    "mysore, india": "mysore", 
    "rajasthan": "rajasthan",
    "rajasthan, india": "rajasthan",
    "uttarakhand": "uttarakhand",
    "uttarakhand, india": "uttarakhand",
    "ladakh": "ladakh",
    "ladakh, india": "ladakh"
  };

  if (mappings[normalized]) return mappings[normalized];
  
  // For any unmapped destinations, just return lowercase with spaces replaced by hyphens
  return destination.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// price formatter for numeric that might be string
function priceLabel(price: unknown, currency?: string | null) {
  if (price == null) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price) : (price as number);
  if (!isFinite(num)) return "Price on request";
  const cur = currency ?? "";
  const val = Intl.NumberFormat("en-IN").format(num);
  return `${cur} ${val}`.trim();
}

// tiny helper so TypeScript stops whining where it shouldn't
function totalPax(n: number) {
  return `${n} total`;
}

/* ---------------- page ---------------- */
export default async function ReceiptPage(props: {
  // Next.js 15: params and searchParams are async
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ destinationId?: string }>;
}) {
  // Await params before touching its properties
  const { id } = await props.params;
  const sp = (await props.searchParams) ?? {};

  console.log("ReceiptPage called with id:", id);

  let tr: any;
  try {
    tr = await getTripRequest(id);
    console.log("Trip request result:", tr ? "found" : "not found");
  } catch (error) {
    console.error("Error in ReceiptPage getTripRequest:", error);
    notFound();
  }

  if (!tr) {
    console.log("Trip request not found, calling notFound()");
    notFound();
  }

  // Always normalize to an ID even if a pretty name is provided in the URL
  const rawDestination = sp.destinationId?.trim() || tr.destination;
  const destinationId = getDestinationId(rawDestination);

  console.log("Receipt page debug:", {
    tripDestination: tr.destination,
    mappedDestinationId: destinationId,
    searchParamsDestinationId: sp.destinationId,
  });

  // Curated activities + suggestions (fallback to simple by-destination query)
  let activities: Activity[] = [];
  try {
    const { selected, suggestions } = await getActivitiesForReceipt(
      id,
      destinationId,
      18
    );
    // de-dup by id
    const seen = new Set<string>();
    activities = [...selected, ...suggestions].filter(
      (a) => !seen.has(a.id) && (seen.add(a.id), true)
    );
  } catch {
    activities = await getActivitiesByDestinationId(destinationId, 18);
  }

  return (
    <section className="relative isolate min-h-[60vh] w-full bg-zinc-950 text-zinc-100">
      {/* backdrop treatments */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(1200px_500px_at_20%_-10%,rgba(255,255,255,0.08)_0%,transparent_60%)]"
      />
      <div className="absolute inset-x-0 top-1/2 -z-10 h-32 overflow-hidden pointer-events-none">
        <div className="glowbar mx-auto h-32 w-[135%]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        {/* Back to Homepage Button */}
        <div className="mb-8 sm:mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
          >
            <svg 
              className="h-4 w-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Trip Summary (replaces the old invoice/pay ticket) */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-zinc-950/70 to-zinc-900/60 p-0.5 backdrop-blur">
          <div className="relative rounded-[28px] bg-zinc-950/60 p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/10 [box-shadow:0_0_0_1px_rgba(255,255,255,0.04),0_0_40px_2px_rgba(180,180,255,0.08)_inset]"
            />

            {/* header strip */}
            <div className="mb-6 sm:mb-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
                Trip summary
              </div>
            </div>

            {/* main grid */}
            <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-[auto_1fr] lg:gap-12">
              {/* left: badge plane */}
              <div className="flex items-center justify-center sm:justify-start">
                <div className="relative grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10">
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    className="opacity-90"
                    aria-hidden
                  >
                    <path
                      d="M21 16.5V14l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2.5l8-2v4l-2 1.5V21l3-1 3 1v-1.5L13 19v-4l8 1.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              {/* center: route + chips */}
              <div className="min-w-0 text-center sm:text-left">
                <h1 className="text-balance text-2xl font-semibold text-white sm:text-3xl">
                  {cityToIATA(tr.origin)}
                  <span className="mx-3 inline-flex items-center text-zinc-400">
                    <span className="mx-2 hidden h-px w-8 bg-white/20 sm:inline-block" />
                    →<span className="mx-2 hidden h-px w-8 bg-white/20 sm:inline-block" />
                  </span>
                  {cityToIATA(tr.destination)}
                </h1>

                <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {fmtDate(tr.startDate)} <span className="text-zinc-400">to</span>{" "}
                    {fmtDate(tr.endDate)}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {tr.adults} adult{tr.adults === 1 ? "" : "s"}
                    {tr.kids
                      ? `, ${tr.kids} child${tr.kids === 1 ? "" : "ren"}`
                      : ""}
                  </div>
                  {tr.passengerName ? (
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                      {tr.passengerName}
                    </div>
                  ) : null}
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white">
                    {`${tr.phoneCountryCode ?? ""} ${tr.phoneNumber ?? ""}`.trim() ||
                      "No contact added"}
                  </div>
                </div>
              </div>

            </div>

            {/* decorative route line */}
            <div
              aria-hidden
              className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </div>
        </div>

        {/* Activities grid */}
        <div className="mt-14 sm:mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Activities in {cityToIATA(tr.destination)}
            </h2>
            <span className="text-xs text-zinc-400" aria-live="polite">
              {activities.length} found
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-zinc-300">
              No activities found for this destination yet. We’ll add options
              during planning.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((a) => (
                <li
                  key={a.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {a.imageUrl ? (
                      <Image
                        src={a.imageUrl}
                        alt={a.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        priority={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800/60 text-zinc-400">
                        No image
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white ring-1 ring-white/20">
                      {a.destinationId}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-medium text-white">
                      {a.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                      {typeof a.reviewCount === "number" && a.reviewCount > 0 ? (
                        <span>★ {a.reviewCount} reviews</span>
                      ) : (
                        <span>New</span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-white">
                        {priceLabel(a.price, a.currency)}
                        {a.price != null ? (
                          <span className="ml-1 text-xs text-zinc-400">from</span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/activities/${a.id}?tripId=${tr.id}`}
                          className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                        >
                          View
                        </Link>
                        <AddToTripButton
                          tripRequestId={tr.id}
                          activityId={a.id}
                          activityName={a.name}
                          activityImageUrl={a.imageUrl}
                          destinationId={a.destinationId}
                          price={typeof a.price === 'string' ? parseFloat(a.price) : a.price}
                          currency={a.currency}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
