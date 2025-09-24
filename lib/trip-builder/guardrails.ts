// lib/trip-builder/guardrails.ts
export const DESTINATIONS = [
  "Dubai, UAE",
  "Singapore, Singapore",
  "Bangkok, Thailand",
  "Bali, Indonesia",
  "Istanbul, Turkey",
  "Maldives, Maldives",
  "Phuket, Thailand",
  "Doha, Qatar",
] as const;

export const ORIGIN_CITIES = [
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "Chennai, India",
  "Kolkata, India",
  "Hyderabad, India",
  "Pune, India",
  "Ahmedabad, India",
  "New York, USA",
  "London, UK",
  "Dubai, UAE",
  "Singapore, Singapore",
] as const;

export const NATIONALITIES = [
  "Indian",
  "NRI",
  "South Asian",
  "American",
  "Other",
] as const;

export const AIRLINES = [
  "Any",
  "IndiGo",
  "Air India",
  "Emirates",
  "Qatar Airways",
  "Vistara",
] as const;

export const ROOMS = [
  "King Bed",
  "Twin Beds",
  "Connecting Rooms",
  "High Floor",
  "Non-Smoking",
  "Accessible",
  "Sea View",
] as const;

export const ACTIVITIES = [
  "Desert Safari",
  "Burj Al Arab Tour",
  "City Tour",
  "Museum",
  "Theme Park",
] as const;

export const HOTEL_PREFERENCES = ["3 Star", "4 Star", "5 Star"] as const;

export const FLIGHT_CLASSES = ["Economy", "Business", "First"] as const;

export const VISA_STATUS = ["Available", "N/A"] as const;

// Tiny fact blurbs used for small talk.
// Keep these brand-safe and non-claimy.
const FACTS: Record<string, string> = {
  "Dubai, UAE": "Desert meets skyscrapers; family-friendly and easy to plan.",
  "Singapore, Singapore":
    "Compact, spotless, wildly efficient. Food courts are elite.",
  "Bangkok, Thailand": "Temples by day, markets by night. Great value.",
  "Bali, Indonesia": "Beach + rice terraces. Photogenic to a rude degree.",
  "Istanbul, Turkey": "Two continents, one city. History stacked on history.",
  "Maldives, Maldives": "Clear lagoons, overwater villas, escape energy.",
  "Phuket, Thailand":
    "Tropical paradise with stunning beaches and vibrant nightlife.",
  "Doha, Qatar":
    "Modern architecture meets traditional culture in the heart of the Middle East.",
};

export function niceFact(dest?: string) {
  return dest && FACTS[dest] ? FACTS[dest] : "Solid choice. Easy planning.";
}

export function whereIs(dest?: string) {
  return dest
    ? `${dest} is a popular, well-connected destination with plenty of family-friendly options.`
    : "A well-connected destination with straightforward planning.";
}
