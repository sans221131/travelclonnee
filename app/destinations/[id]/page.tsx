export const runtime = "nodejs";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivitiesByDestinationId } from "@/lib/db";
import DestinationActivitiesGrid from "../../../components/destinations/DestinationActivitiesGrid";

// Mapping destination IDs to display info (matching carousel data)
const DESTINATION_INFO: Record<string, { 
  title: string; 
  subtitle: string; 
  image: string; 
  description: string;
  whyVisit?: string[];
  highlights?: string[];
  bestFor?: string[];
  whenToVisit?: string;
}> = {
  "dubai": {
    title: "Dubai",
    subtitle: "Luxury & Architecture",
    image: "/images/dubai.jpg",
    description: "Experience the epitome of luxury and modern architecture in this desert metropolis. From the world's tallest building to pristine beaches, Dubai offers endless adventures.",
    whyVisit: [
      "Home to the world's tallest building, Burj Khalifa, offering breathtaking panoramic views from 828 meters high",
      "Unparalleled shopping experience with massive malls like Dubai Mall and Mall of the Emirates featuring indoor skiing",
      "Pristine beaches and crystal-clear waters of the Arabian Gulf perfect for water sports and relaxation",
      "World-class dining scene with celebrity chef restaurants and authentic Middle Eastern cuisine",
      "Ultra-modern infrastructure combined with rich Arabian heritage and culture",
      "Year-round sunshine and luxurious resorts offering exceptional hospitality"
    ],
    highlights: [
      "Burj Khalifa & Dubai Fountain",
      "Palm Jumeirah & Atlantis",
      "Desert Safari Adventures",
      "Gold & Spice Souks",
      "Dubai Marina & JBR Walk",
      "Museum of the Future"
    ],
    bestFor: [
      "Luxury travelers seeking world-class experiences",
      "Adventure enthusiasts looking for desert thrills",
      "Shopping lovers and fashion enthusiasts",
      "Families wanting theme parks and beaches",
      "Architecture and design admirers",
      "Food connoisseurs exploring global cuisines"
    ],
    whenToVisit: "November to March offers perfect weather with temperatures between 20-30°C, ideal for outdoor activities and beach time."
  },
  "thailand": {
    title: "Thailand",
    subtitle: "Beaches & Culture",
    image: "/images/thailand.jpg",
    description: "Discover the perfect blend of tropical paradise and rich cultural heritage. Thailand captivates with its golden temples, stunning beaches, and warm hospitality."
  },
  "london": {
    title: "London",
    subtitle: "History & Charm",
    image: "/images/london.jpg",
    description: "Walk through centuries of history in one of the world's most iconic cities. From royal palaces to modern art, London seamlessly blends tradition with innovation."
  },
  "united-states": {
    title: "United States",
    subtitle: "Diversity & Adventure",
    image: "/images/united-states.jpg",
    description: "Explore a nation of endless possibilities, from bustling metropolises to breathtaking natural wonders. Every state offers unique experiences and unforgettable moments."
  },
  "bali": {
    title: "Bali",
    subtitle: "Tropical Paradise",
    image: "/images/bali.jpg",
    description: "Find your slice of paradise on the Island of the Gods. Bali enchants visitors with its lush rice terraces, ancient temples, and world-class beaches."
  },
  "switzerland": {
    title: "Switzerland",
    subtitle: "Alps & Serenity",
    image: "/images/switzerland.jpg",
    description: "Immerse yourself in Alpine beauty and Swiss precision. From snow-capped peaks to pristine lakes, Switzerland is a haven for nature lovers and adventure seekers."
  },
  "paris": {
    title: "Paris",
    subtitle: "Romance & Art",
    image: "/images/paris.jpg",
    description: "Fall in love with the City of Light. Paris captivates with its timeless elegance, world-renowned art, and unmatched culinary scene."
  },
  "bhutan": {
    title: "Bhutan",
    subtitle: "Himalayan Kingdom",
    image: "/images/bhutan.png",
    description: "Journey to the last Himalayan kingdom where happiness is measured differently. Bhutan offers pristine nature, ancient monasteries, and profound spiritual experiences."
  },
  "maldives": {
    title: "Maldives",
    subtitle: "Crystal Waters",
    image: "/images/maldives.jpg",
    description: "Experience paradise on Earth in this tropical island nation. The Maldives dazzles with its crystal-clear waters, vibrant coral reefs, and luxurious overwater villas."
  },
  "kerala": {
    title: "Kerala",
    subtitle: "God's Own Country",
    image: "/images/kerala.jpg",
    description: "Discover India's tropical paradise with serene backwaters, lush greenery, and rich cultural traditions. Kerala offers a perfect blend of relaxation and exploration."
  },
  "assam": {
    title: "Assam",
    subtitle: "Tea Gardens & Wildlife",
    image: "/images/assam.jpg",
    description: "Explore the land of tea gardens and one-horned rhinos. Assam enchants with its verdant landscapes, diverse wildlife, and vibrant Assamese culture."
  },
  "himachal": {
    title: "Himachal",
    subtitle: "Mountain Retreat",
    image: "/images/himachal.jpg",
    description: "Escape to the mountains of Himachal Pradesh. From adventure sports to spiritual retreats, this Himalayan state offers breathtaking views and peaceful sanctuaries."
  },
  "meghalaya": {
    title: "Meghalaya",
    subtitle: "Abode of Clouds",
    image: "/images/meghalaya.jpg",
    description: "Visit one of the wettest places on Earth, where nature's beauty knows no bounds. Meghalaya captivates with its living root bridges, waterfalls, and misty hills."
  },
  "mysore": {
    title: "Mysore",
    subtitle: "Royal Heritage",
    image: "/images/mysore.jpg",
    description: "Step into royal splendor in this historic city of palaces. Mysore charms visitors with its rich heritage, magnificent architecture, and cultural traditions."
  },
  "rajasthan": {
    title: "Rajasthan",
    subtitle: "Desert Majesty",
    image: "/images/rajasthan.jpg",
    description: "Experience the grandeur of India's desert kingdom. Rajasthan dazzles with its majestic forts, vibrant culture, and tales of royal valor."
  },
  "uttarakhand": {
    title: "Uttarakhand",
    subtitle: "Spiritual Heights",
    image: "/images/uttarakhand.jpg",
    description: "Find spiritual solace in the land of gods. Uttarakhand offers sacred pilgrimage sites, yoga retreats, and stunning Himalayan vistas."
  },
  "ladakh": {
    title: "Ladakh",
    subtitle: "Cold Desert Beauty",
    image: "/images/ladakh.jpg",
    description: "Journey to the roof of the world in this high-altitude desert. Ladakh mesmerizes with its stark beauty, Buddhist monasteries, and adventure opportunities."
  }
};

function priceLabel(price: unknown, currency?: string | null) {
  if (price == null) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price) : (price as number);
  if (!isFinite(num)) return "Price on request";
  const cur = currency ?? "";
  const val = Intl.NumberFormat("en-IN").format(num);
  return `${cur} ${val}`.trim();
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const destination = DESTINATION_INFO[id];
  if (!destination) {
    notFound();
  }

  // Fetch activities for this destination
  const activities = await getActivitiesByDestinationId(id, 24);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image
          src={destination.image}
          alt={destination.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />
        
        <Link 
          href="/"
          className="absolute left-6 top-6 z-10 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{destination.subtitle}</span>
            </div>
            
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {destination.title}
            </h1>
            
            <p className="max-w-3xl text-lg text-zinc-200">
              {destination.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900"></div>
        
        <div className="relative mx-auto max-w-6xl px-6 py-12 space-y-16">
          
          {/* Why Visit Section */}
          {destination.whyVisit && destination.whyVisit.length > 0 && (
            <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/2 p-8">
              <h2 className="mb-6 text-3xl font-bold text-white">Why Visit {destination.title}?</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {destination.whyVisit.map((reason, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Highlights & Best For Grid */}
          {(destination.highlights || destination.bestFor) && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Highlights */}
              {destination.highlights && destination.highlights.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Top Highlights</h3>
                  </div>
                  <ul className="space-y-3">
                    {destination.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-zinc-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best For */}
              {destination.bestFor && destination.bestFor.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/20 to-orange-900/20 p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                      <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Perfect For</h3>
                  </div>
                  <ul className="space-y-3">
                    {destination.bestFor.map((category, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-zinc-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                        <span>{category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* When to Visit */}
          {destination.whenToVisit && (
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-white">Best Time to Visit</h3>
                  <p className="text-lg text-zinc-300 leading-relaxed">{destination.whenToVisit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Activities Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white">Experiences in {destination.title}</h2>
              <p className="mt-2 text-zinc-400">
                {activities.length > 0 
                  ? `Choose from ${activities.length} curated activities`
                  : "Activities coming soon"}
              </p>
            </div>

          {activities.length > 0 ? (
            <DestinationActivitiesGrid 
              activities={activities} 
              destinationTitle={destination.title}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <svg className="h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Activities Coming Soon</h3>
              <p className="text-sm text-zinc-400">
                We're curating the best experiences for {destination.title}. Check back soon!
              </p>
            </div>
          )}
          </section>

          {/* CTA to proceed to cart/checkout */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 text-center">
            <h3 className="mb-2 text-2xl font-semibold text-white">
              Ready to finalize your trip?
            </h3>
            <p className="mb-6 text-zinc-300">
              Add activities to your cart, then proceed to create your custom trip itinerary.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link 
                href="/"
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/20"
              >
                Browse More Destinations
              </Link>
            </div>
          </div>
        
        </div>
      </main>
    </div>
  );
}
