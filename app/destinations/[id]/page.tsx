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
  topHighlights?: string[];
  quickFacts?: {
    bestTime?: string;
    currency?: string;
    language?: string;
  };
  categories?: {
    architecture?: string[];
    shopping?: string[];
    entertainment?: string[];
    culture?: string[];
  };
  perfectFor?: {
    icon: string;
    title: string;
    description: string;
  }[];
}> = {
  "dubai": {
    title: "Dubai",
    subtitle: "Luxury & Architecture",
    image: "/images/dubai.jpg",
    description: "Experience the epitome of luxury and modern architecture in this desert metropolis. From the world's tallest building to pristine beaches, Dubai offers endless adventures.",
    topHighlights: [
      "World's tallest building - Burj Khalifa",
      "Luxury shopping at Dubai Mall",
      "Palm Jumeirah artificial island",
      "Traditional gold and spice souks",
      "Desert safaris and dune bashing",
      "World-class dining experiences"
    ],
    quickFacts: {
      bestTime: "November to March",
      currency: "AED (Dirham)",
      language: "Arabic (English widely spoken)"
    },
    categories: {
      architecture: [
        "Burj Khalifa",
        "Burj Al Arab",
        "Museum of the Future"
      ],
      shopping: [
        "Dubai Mall",
        "Mall of the Emirates",
        "Gold Souk"
      ],
      entertainment: [
        "Dubai Fountain",
        "IMG Worlds",
        "Ski Dubai"
      ],
      culture: [
        "Dubai Museum",
        "Al Fahidi District",
        "Jumeirah Mosque"
      ]
    },
    perfectFor: [
      {
        icon: "luxury",
        title: "Luxury Travelers",
        description: "World-class hotels, fine dining, and exclusive shopping experiences"
      },
      {
        icon: "family",
        title: "Families",
        description: "Theme parks, beaches, and family-friendly attractions throughout"
      },
      {
        icon: "adventure",
        title: "Adventure Seekers",
        description: "Desert safaris, skydiving, and water sports activities"
      },
      {
        icon: "shopping",
        title: "Shopping Enthusiasts",
        description: "From traditional souks to ultra-modern malls with global brands"
      }
    ]
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
          
          {/* Highlights & Essential Info Section */}
          {(destination.topHighlights || destination.quickFacts) && (
            <section>
              <h2 className="mb-8 text-3xl font-bold text-white">Highlights & Essential Info</h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Highlights */}
                {destination.topHighlights && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
                    <h3 className="mb-6 text-2xl font-semibold text-white">Top Highlights</h3>
                    <ul className="space-y-3">
                      {destination.topHighlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg className="mt-1 h-5 w-5 shrink-0 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-zinc-300">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Facts */}
                {destination.quickFacts && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/10 to-transparent p-8">
                    <h3 className="mb-6 text-2xl font-semibold text-white">Quick Facts</h3>
                    <div className="space-y-4">
                      {destination.quickFacts.bestTime && (
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Best Time to Visit</div>
                            <div className="font-semibold text-white">{destination.quickFacts.bestTime}</div>
                          </div>
                        </div>
                      )}
                      {destination.quickFacts.currency && (
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                            <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Currency</div>
                            <div className="font-semibold text-white">{destination.quickFacts.currency}</div>
                          </div>
                        </div>
                      )}
                      {destination.quickFacts.language && (
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                            <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Language</div>
                            <div className="font-semibold text-white">{destination.quickFacts.language}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Destination Highlights by Category */}
          {destination.categories && (
            <section>
              <h2 className="mb-8 text-3xl font-bold text-white">Destination Highlights by Category</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {destination.categories.architecture && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                    <h3 className="mb-4 text-xl font-semibold text-blue-400">Architecture</h3>
                    <ul className="space-y-2">
                      {destination.categories.architecture.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {destination.categories.shopping && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                    <h3 className="mb-4 text-xl font-semibold text-emerald-400">Shopping</h3>
                    <ul className="space-y-2">
                      {destination.categories.shopping.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {destination.categories.entertainment && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                    <h3 className="mb-4 text-xl font-semibold text-purple-400">Entertainment</h3>
                    <ul className="space-y-2">
                      {destination.categories.entertainment.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {destination.categories.culture && (
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                    <h3 className="mb-4 text-xl font-semibold text-amber-400">Culture</h3>
                    <ul className="space-y-2">
                      {destination.categories.culture.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Perfect For Section */}
          {destination.perfectFor && (
            <section>
              <h2 className="mb-4 text-3xl font-bold text-white">Perfect For</h2>
              <p className="mb-8 text-zinc-400">This destination is ideally suited for the following types of travelers:</p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {destination.perfectFor.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                        {item.icon === "luxury" && (
                          <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        )}
                        {item.icon === "family" && (
                          <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {item.icon === "adventure" && (
                          <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        {item.icon === "shopping" && (
                          <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="text-zinc-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activities Section */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white">Popular Activities & Experiences</h2>
              <p className="mt-2 text-zinc-400">
                {activities.length > 0 
                  ? `Discover ${activities.length} amazing experiences in ${destination.title}`
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
