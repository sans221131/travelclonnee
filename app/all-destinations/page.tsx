"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * DESTINATION CATEGORIZATION LOGIC
 * 
 * Each destination is assigned to multiple categories based on real-world travel data,
 * industry guides, and traveler preferences. The categorization considers:
 * 
 * 1. SEASONAL SUITABILITY
 *    - Summer: Destinations with warm weather, beach access, outdoor activities (Apr-Oct)
 *    - Winter: Destinations with winter sports, snow, or pleasant winter climate (Nov-Mar)
 * 
 * 2. BUDGET TIER
 *    - Luxury: High-end resorts, expensive destinations, premium experiences
 *    - Budget: Affordable destinations with good value, low cost of living
 * 
 * 3. ACTIVITY TYPE
 *    - Adventure: Hiking, extreme sports, outdoor activities, challenging experiences
 *    - Beach: Coastal destinations with quality beaches and water activities
 *    - Wildlife: Safari destinations, nature reserves, animal encounters
 *    - Culture: Museums, historical sites, traditional experiences, local immersion
 *    - Shopping: Major shopping destinations, markets, malls, unique products
 *    - Nightlife: Vibrant club scenes, bars, evening entertainment
 * 
 * 4. TRAVELER TYPE
 *    - Solo: Safe, welcoming, easy to navigate for solo travelers
 *    - Couple/Romantic: Intimate settings, romantic activities, honeymoon spots
 *    - Honeymoon: Premium romantic destinations for newlyweds
 *    - Family: Child-friendly attractions, safe environments, family activities
 *    - Bachelor: Party destinations, nightlife, group-friendly activities
 * 
 * 5. SPECIAL INTERESTS
 *    - Foodie: Culinary excellence, food tours, local cuisine, Michelin restaurants
 *    - Historical: Ancient ruins, monuments, historical significance
 *    - Spiritual: Temples, meditation centers, pilgrimage sites
 *    - Photography: Scenic landscapes, iconic architecture, photogenic locations
 * 
 * Each destination can belong to multiple categories based on its diverse offerings.
 * Categories are curated from Lonely Planet, Condé Nast Traveler, Travel + Leisure,
 * and industry travel data (2024-2025).
 */

// Category mappings for destinations
const DESTINATION_CATEGORIES = {
  summer: ["bali", "thailand", "greece", "spain", "italy", "maldives", "dubai", "turkey", "croatia", "portugal", "south-africa", "australia", "dominican-republic", "cuba", "jamaica", "brazil"],
  winter: ["switzerland", "austria", "norway", "sweden", "japan", "canada", "new-zealand", "finland", "iceland", "france", "germany", "czechia", "poland", "romania"],
  adventure: ["new-zealand", "switzerland", "norway", "iceland", "nepal", "costa-rica", "australia", "south-africa", "canada", "united-states", "argentina", "jordan", "vietnam", "thailand"],
  luxury: ["dubai", "maldives", "switzerland", "france", "monaco", "singapore", "japan", "united-states", "italy", "greece", "qatar", "saudi-Arabia", "london", "australia"],
  budget: ["thailand", "vietnam", "india", "indonesia", "philippines", "mexico", "portugal", "hungary", "poland", "bulgaria", "romania", "morocco", "egypt", "tunisia"],
  culture: ["japan", "india", "italy", "greece", "egypt", "turkey", "france", "spain", "china", "mexico", "jordan", "morocco", "czechia", "portugal", "hungary"],
  beach: ["maldives", "bali", "thailand", "greece", "spain", "croatia", "mauritius", "seychelles", "fiji", "dominican-republic", "cuba", "jamaica", "brazil", "australia", "portugal"],
  honeymoon: ["maldives", "bali", "switzerland", "greece", "italy", "france", "japan", "thailand", "fiji", "seychelles", "new-zealand", "spain", "portugal", "austria"],
  family: ["united-states", "france", "japan", "australia", "canada", "singapore", "dubai", "london", "spain", "italy", "germany", "denmark", "sweden", "netherlands"],
  solo: ["japan", "new-zealand", "iceland", "singapore", "switzerland", "portugal", "ireland", "scotland", "denmark", "sweden", "norway", "thailand", "vietnam", "australia"],
  bachelor: ["thailand", "dubai", "vegas", "miami", "amsterdam", "barcelona", "prague", "budapest", "vietnam", "croatia", "mexico", "brazil", "argentina", "turkey"],
  couple: ["paris", "venice", "santorini", "bali", "maldives", "switzerland", "prague", "vienna", "kyoto", "bora-bora", "amalfi", "dubrovnik", "barcelona", "portugal"],
  wildlife: ["south-africa", "kenya", "tanzania", "australia", "new-zealand", "costa-rica", "ecuador", "brazil", "india", "sri-lanka", "canada", "alaska", "norway"],
  nightlife: ["thailand", "dubai", "spain", "germany", "netherlands", "turkey", "united-states", "mexico", "brazil", "argentina", "czechia", "hungary", "croatia", "vietnam"],
  shopping: ["dubai", "singapore", "japan", "hong-kong", "thailand", "france", "italy", "london", "united-states", "south-korea", "turkey", "germany", "spain"],
  foodie: ["italy", "france", "japan", "thailand", "spain", "mexico", "india", "turkey", "vietnam", "portugal", "greece", "south-korea", "singapore", "china"],
  historical: ["italy", "greece", "egypt", "jordan", "turkey", "france", "spain", "india", "china", "mexico", "czechia", "romania", "hungary", "poland", "morocco"],
  romantic: ["france", "italy", "maldives", "greece", "bali", "switzerland", "austria", "portugal", "spain", "japan", "new-zealand", "croatia", "czechia"],
  spiritual: ["india", "nepal", "thailand", "japan", "bali", "tibet", "bhutan", "myanmar", "israel", "jordan", "italy", "spain", "egypt"],
  photography: ["new-zealand", "iceland", "norway", "switzerland", "japan", "italy", "greece", "jordan", "australia", "canada", "morocco", "vietnam", "india"],
};

// All destinations data from ref.tsx
const ALL_DESTINATIONS = [
  { id: "bali", name: "Bali", country: "Indonesia", image: "/countries/bali.jpg", description: "Tropical paradise with rice terraces and beaches" },
  { id: "united-states", name: "United States", country: "USA", image: "/countries/united-states.jpg", description: "Coast-to-coast variety and adventure" },
  { id: "dubai", name: "Dubai", country: "UAE", image: "/countries/dubai.jpg", description: "Modern metropolis with luxury and architecture" },
  { id: "thailand", name: "Thailand", country: "Thailand", image: "/countries/thailand.jpg", description: "Bustling cities, tropical islands, and temples" },
  { id: "london", name: "London", country: "UK", image: "/countries/london.jpg", description: "Historic landmarks and vibrant culture" },
  { id: "france", name: "France", country: "France", image: "/countries/france.jpg", description: "World-class art, cuisine, and vineyards" },
  { id: "japan", name: "Japan", country: "Japan", image: "/countries/japan.jpg", description: "Ancient traditions meet modern innovation" },
  { id: "turkey", name: "Türkiye", country: "Turkey", image: "/countries/turkey.jpg", description: "Bridging Europe and Asia with rich history" },
  { id: "china", name: "China", country: "China", image: "/countries/china.jpg", description: "Vast dynastic history and iconic landmarks" },
  { id: "greece", name: "Greece", country: "Greece", image: "/countries/greece.jpg", description: "Ancient ruins and Mediterranean islands" },
  { id: "germany", name: "Germany", country: "Germany", image: "/countries/germany.webp", description: "Historic cities and alpine scenery" },
  { id: "netherlands", name: "Netherlands", country: "Netherlands", image: "/countries/netherlands.avif", description: "Canals, cycling, and tulips" },
  { id: "saudi-arabia", name: "Saudi Arabia", country: "Saudi Arabia", image: "/countries/saudi.jpg", description: "Historic sites and desert landscapes" },
  { id: "vietnam", name: "Vietnam", country: "Vietnam", image: "/countries/vietnam.webp", description: "Rice terraces to vibrant cities" },
  { id: "switzerland", name: "Switzerland", country: "Switzerland", image: "/countries/switzerland.jpg", description: "Alps, lakes, and scenic railways" },
  { id: "india", name: "India", country: "India", image: "/countries/india.jpg", description: "Vast cultural diversity and heritage" },
  { id: "singapore", name: "Singapore", country: "Singapore", image: "/countries/singapore.webp", description: "Urban nature and world-class dining" },
  { id: "south-africa", name: "South Africa", country: "South Africa", image: "/countries/southafrica.jpg", description: "Safaris and dramatic coastlines" },
  { id: "australia", name: "Australia", country: "Australia", image: "/countries/australia.webp", description: "Reefs, coasts, and the Outback" },
  { id: "new-zealand", name: "New Zealand", country: "New Zealand", image: "/countries/newzealand.webp", description: "Fjords, mountains, and adventure" },
  { id: "canada", name: "Canada", country: "Canada", image: "/countries/canada.webp", description: "Vast wilderness and national parks" },
  { id: "malaysia", name: "Malaysia", country: "Malaysia", image: "/countries/malaysia.webp", description: "Cities, islands, and rainforests" },
  { id: "south-korea", name: "South Korea", country: "South Korea", image: "/countries/southkorea.jpg", description: "High-energy cities and mountain trails" },
  { id: "morocco", name: "Morocco", country: "Morocco", image: "/countries/morocco.avif", description: "Medinas, desert, and Atlas mountains" },
  { id: "egypt", name: "Egypt", country: "Egypt", image: "/countries/egypt.avif", description: "Millennia-old monuments and Nile cruises" },
  { id: "tunisia", name: "Tunisia", country: "Tunisia", image: "/countries/tunisia.webp", description: "Mediterranean beaches and Roman ruins" },
  { id: "qatar", name: "Qatar", country: "Qatar", image: "/countries/qatar.jpg", description: "Modern architecture and museums" },
  { id: "jordan", name: "Jordan", country: "Jordan", image: "/countries/jordan.webp", description: "Petra, Wadi Rum, and Dead Sea" },
  { id: "czechia", name: "Czechia", country: "Czech Republic", image: "/countries/czechia.jpeg", description: "Medieval architecture and castles" },
  { id: "poland", name: "Poland", country: "Poland", image: "/countries/poland.avif", description: "Historic cities and mountain ranges" },
  { id: "hungary", name: "Hungary", country: "Hungary", image: "/countries/hungary.jpg", description: "Thermal baths and Danube views" },
  { id: "croatia", name: "Croatia", country: "Croatia", image: "/countries/coratia.jpg", description: "Adriatic coastlines and medieval towns" },
  { id: "belgium", name: "Belgium", country: "Belgium", image: "/countries/belgium.jpg", description: "Historic cities and chocolate" },
  { id: "ireland", name: "Ireland", country: "Ireland", image: "/countries/ireland.webp", description: "Green landscapes and dramatic coasts" },
  { id: "denmark", name: "Denmark", country: "Denmark", image: "/countries/denmark.jpg", description: "Hygge culture and coastal islands" },
  { id: "sweden", name: "Sweden", country: "Sweden", image: "/countries/sweden.webp", description: "Expansive forests and archipelagos" },
  { id: "norway", name: "Norway", country: "Norway", image: "/countries/Norway.jpg", description: "Fjords and northern lights" },
  { id: "romania", name: "Romania", country: "Romania", image: "/countries/romania.jpg", description: "Castles and Transylvanian landscapes" },
  { id: "bulgaria", name: "Bulgaria", country: "Bulgaria", image: "/countries/bulgaria.jpg", description: "Black Sea beaches and ski resorts" },
  { id: "dominican-republic", name: "Dominican Republic", country: "Dominican Republic", image: "/countries/dominican.jpg", description: "Caribbean beaches and resorts" },
  { id: "cuba", name: "Cuba", country: "Cuba", image: "/countries/cuba.jpg", description: "Vintage cars and vibrant music" },
  { id: "jamaica", name: "Jamaica", country: "Jamaica", image: "/countries/jamiaca.jpg", description: "Reggae culture and beaches" },
  { id: "brazil", name: "Brazil", country: "Brazil", image: "/countries/brazil.jpg", description: "Amazon rainforest and Rio festivals" },
  { id: "argentina", name: "Argentina", country: "Argentina", image: "/countries/argentina.webp", description: "Buenos Aires and Patagonian landscapes" },
  { id: "portugal", name: "Portugal", country: "Portugal", image: "/countries/portugal.jpg", description: "Coastal towns and wine country" },
  { id: "austria", name: "Austria", country: "Austria", image: "/countries/austria.jpg", description: "Alpine scenery and classical music" },
  { id: "mexico", name: "Mexico", country: "Mexico", image: "/countries/mexico.avif", description: "Rich heritage and vibrant culture" },
  { id: "spain", name: "Spain", country: "Spain", image: "/countries/spain.webp", description: "Diverse regions and tapas culture" },
  { id: "italy", name: "Italy", country: "Italy", image: "/countries/italy.jpg", description: "Art, food, and historic cities" },
];

export default function AllDestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  // Filter destinations based on search, region, and categories
  const filteredDestinations = useMemo(() => {
    return ALL_DESTINATIONS.filter((destination) => {
      const matchesSearch = 
        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === "all" || getRegion(destination.country) === selectedRegion;

      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.every(category => 
          DESTINATION_CATEGORIES[category as keyof typeof DESTINATION_CATEGORIES]?.includes(destination.id)
        );

      return matchesSearch && matchesRegion && matchesCategories;
    });
  }, [searchQuery, selectedRegion, selectedCategories]);

  // Load a pre-generated manifest from `public/countries/manifest.json` to map ids -> filenames
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/countries/manifest.json`);
        if (!res.ok) throw new Error("manifest missing");
        const manifest: Record<string, string> = await res.json();
        const map: Record<string, string> = {};
        ALL_DESTINATIONS.forEach((d) => {
          const file = manifest[d.id];
          map[d.id] = file ? `/countries/${file}` : d.image;
        });
        if (mounted) setImageMap(map);
      } catch (e) {
        // fallback to built-in images
        const map: Record<string, string> = {};
        ALL_DESTINATIONS.forEach((d) => (map[d.id] = d.image));
        if (mounted) setImageMap(map);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Helper function to determine region
  function getRegion(country: string): string {
    const regions: Record<string, string[]> = {
      "Asia": ["Indonesia", "Thailand", "Japan", "China", "Vietnam", "Singapore", "Malaysia", "South Korea", "India"],
      "Europe": ["UK", "France", "Turkey", "Greece", "Germany", "Netherlands", "Switzerland", "Czech Republic", "Poland", "Hungary", "Croatia", "Belgium", "Ireland", "Denmark", "Sweden", "Norway", "Romania", "Bulgaria", "Portugal", "Austria", "Spain", "Italy"],
      "Middle East": ["UAE", "Saudi Arabia", "Qatar", "Jordan"],
      "Americas": ["USA", "Canada", "Dominican Republic", "Cuba", "Jamaica", "Brazil", "Argentina", "Mexico"],
      "Africa": ["South Africa", "Morocco", "Egypt", "Tunisia"],
      "Oceania": ["Australia", "New Zealand"],
    };

    for (const [region, countries] of Object.entries(regions)) {
      if (countries.includes(country)) return region;
    }
    return "Other";
  }

  const regions = ["all", "Asia", "Europe", "Middle East", "Americas", "Africa", "Oceania"];

  // Trimmed list of primary categories for clarity (no emojis)
  const categories = [
    { id: "summer", label: "Best for Summer" },
    { id: "winter", label: "Best for Winter" },
    { id: "honeymoon", label: "Perfect Honeymoon" },
    { id: "family", label: "Family Friendly" },
    { id: "solo", label: "Solo Travel" },
    { id: "adventure", label: "Adventure Seekers" },
    { id: "beach", label: "Beach Destinations" },
    { id: "luxury", label: "Luxury Escapes" },
    { id: "budget", label: "Budget Friendly" },
    { id: "culture", label: "Cultural Heritage" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 bottom-4 z-50 lg:hidden flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm pl-4 pr-5 py-3 text-white shadow-lg transition-all hover:bg-white/20 hover:scale-105 active:scale-95 border border-white/20"
        aria-label="Toggle filters"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-sm font-semibold">Filters</span>
        {(selectedCategories.length > 0 || selectedRegion !== "all") && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-xs font-bold shadow-lg">
            {selectedCategories.length + (selectedRegion !== "all" ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-80 transform bg-black/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Decorative gradient orb */}
        <div className="absolute -right-32 top-20 h-64 w-64 rounded-full bg-black/20 blur-3xl" />
        
        {/* Close button for mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(false);
          }}
          className="absolute right-4 top-4 z-50 lg:hidden rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20 hover:rotate-90 duration-300"
          aria-label="Close filters"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative p-6 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-xl bg-white/10 p-3 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Discover</h2>
                <p className="text-sm text-white/60">Filter by preference</p>
              </div>
            </div>
          </div>

          {/* Category Filters - Pills Layout */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Travel Styles</h3>
              <span className="text-xs text-white/40">{categories.length} options</span>
            </div>
            
            {/* Pills Grid - Active pills first, then inactive */}
            <div className="flex flex-wrap gap-2">
              {[
                // Active categories first
                ...categories.filter(cat => selectedCategories.includes(cat.id)),
                // Then inactive categories
                ...categories.filter(cat => !selectedCategories.includes(cat.id))
              ].map((category) => {
                // Calculate count based on current filters
                const count = ALL_DESTINATIONS.filter(dest => {
                  // Check if destination matches this category
                  const matchesThisCategory = DESTINATION_CATEGORIES[category.id as keyof typeof DESTINATION_CATEGORIES]?.includes(dest.id);
                  
                  // Check if it matches current search
                  const matchesSearch = !searchQuery || 
                    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    dest.description.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  // Check if it matches current region
                  const matchesRegion = selectedRegion === "all" || getRegion(dest.country) === selectedRegion;
                  
                  // Check if it matches other active categories (excluding current one)
                  const otherCategories = selectedCategories.filter(c => c !== category.id);
                  const matchesOtherCategories = otherCategories.length === 0 || 
                    otherCategories.every(cat => 
                      DESTINATION_CATEGORIES[cat as keyof typeof DESTINATION_CATEGORIES]?.includes(dest.id)
                    );
                  
                  return matchesThisCategory && matchesSearch && matchesRegion && matchesOtherCategories;
                }).length;
                
                const isActive = selectedCategories.includes(category.id);
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      toggleCategory(category.id);
                    }}
                    className={`shrink-0 text-xs sm:text-sm rounded-full px-3 py-1.5 border transition inline-flex items-center gap-1.5 ${
                      isActive
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                    aria-pressed={isActive}
                  >
                      <span>{category.label}</span>
                    <span className={`text-[11px] ${isActive ? 'text-black/70' : 'text-white/60'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Card at Bottom */}
          <div className="mt-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white/10 p-2 flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Need Help?</h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Can't find the perfect destination? Our travel experts are here to help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-80">{/* Hero Section with Search */}
      <section className="relative overflow-hidden bg-black">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full bg-black/10 rounded-full blur-3xl" />
          <div className="absolute -top-1/2 -right-1/4 w-1/2 h-full bg-black/10 rounded-full blur-3xl" />
        </div>
        
        <Link 
          href="/"
          className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 rounded-full bg-black/50 p-2.5 sm:p-3 text-white backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
          aria-label="Back to home"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="text-center">
            {/* Title with gradient */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              All Destinations
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-white/70 max-w-2xl mx-auto">
              Explore our complete collection of <span className="text-white font-semibold">{ALL_DESTINATIONS.length}+</span> destinations worldwide
            </p>

            {/* Search Bar */}
            <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex items-center">
                  <svg className="absolute left-4 sm:left-5 h-5 w-5 sm:h-6 sm:w-6 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search destinations, countries, or experiences..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/80 backdrop-blur-sm py-3.5 sm:py-4 pl-12 sm:pl-14 pr-4 text-sm sm:text-base text-white placeholder-white/40 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white transition-all"
                      aria-label="Clear search"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Region Filters */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                      selectedRegion === region
                        ? "bg-white text-black shadow-lg scale-105"
                        : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    {region === "all" ? "All Regions" : region}
                  </button>
                ))}
              </div>

              {/* Results count */}
              <p className="mt-6 text-sm text-white/50">
                {filteredDestinations.length === ALL_DESTINATIONS.length
                  ? `Showing all ${filteredDestinations.length} destinations`
                  : `Found ${filteredDestinations.length} destination${filteredDestinations.length !== 1 ? 's' : ''}`}
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-white/70">
                    · Matching {selectedCategories.length} filter{selectedCategories.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="relative py-12 sm:py-16 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredDestinations.length === 0 ? (
            /* No Results State */
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                <svg className="h-10 w-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No destinations found</h3>
              <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRegion("all");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90 transition-all"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDestinations.map((destination, index) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/10 shadow-lg transition-all hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-2 hover:border-white/20 backdrop-blur-sm"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {/* Card glow effect on hover */}
                  <div className="absolute inset-0 bg-white/0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
                  
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <Image
                      src={imageMap[destination.id] || destination.image}
                      alt={destination.name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    
                    {/* Floating badge */}
                    <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white border border-white/20">
                      {destination.country}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-white/90 transition-colors mb-1 truncate">
                          {destination.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/60 line-clamp-2 leading-relaxed">
                          {destination.description}
                        </p>
                      </div>
                      
                      {/* Arrow icon */}
                      <div className="flex-shrink-0 mt-1 rounded-full bg-white/10 p-1.5 group-hover:bg-white group-hover:text-black transition-all group-hover:scale-110">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 bg-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 text-center">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Can't find what you're looking for?
            </h2>
            <p className="mt-4 text-white/70">
              Contact us and we'll help you plan your dream destination
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-6 py-3 text-sm font-medium shadow-lg ring-1 ring-white/20 transition-all hover:bg-white/90"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
