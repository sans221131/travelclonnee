// lib/trip-builder/guardrails.ts
export const DESTINATIONS = [
  "Dubai, UAE",
  "Bangkok, Thailand",
  "London, UK",
  "New York, USA",
  "Bali, Indonesia",
  "Switzerland",
  "Paris, France",
  "Bhutan",
  "Maldives, Maldives",
  "Kerala, India",
  "Assam, India",
  "Himachal Pradesh, India",
  "Meghalaya, India",
  "Mysore, India",
  "Rajasthan, India",
  "Uttarakhand, India",
  "Ladakh, India",
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
  "Bangkok, Thailand": "Temples by day, markets by night. Great value.",
  "London, UK": "Royal heritage meets modern culture in this iconic city.",
  "New York, USA": "The city that never sleeps, full of endless possibilities.",
  "Bali, Indonesia": "Beach + rice terraces. Photogenic to a rude degree.",
  "Switzerland": "Alpine beauty, pristine lakes, and charming mountain villages.",
  "Paris, France": "The city of lights, romance, and world-class cuisine.",
  "Bhutan": "Himalayan kingdom with pristine nature and Buddhist culture.",
  "Maldives, Maldives": "Clear lagoons, overwater villas, escape energy.",
  "Kerala, India": "God's own country with backwaters, spices, and lush greenery.",
  "Assam, India": "Tea gardens, wildlife sanctuaries, and rich cultural heritage.",
  "Himachal Pradesh, India": "Hill stations, snow-capped peaks, and serene valleys.",
  "Meghalaya, India": "Abode of clouds with living root bridges and waterfalls.",
  "Mysore, India": "Royal heritage, magnificent palaces, and cultural traditions.",
  "Rajasthan, India": "Land of kings, majestic palaces, and desert adventures.",
  "Uttarakhand, India": "Spiritual heights with holy rivers and mountain retreats.",
  "Ladakh, India": "High-altitude desert with breathtaking landscapes and Buddhist culture.",
};

export function niceFact(dest?: string) {
  return dest && FACTS[dest] ? FACTS[dest] : "Solid choice. Easy planning.";
}

export function whereIs(dest?: string) {
  return dest
    ? `${dest} is a popular, well-connected destination with plenty of family-friendly options.`
    : "A well-connected destination with straightforward planning.";
}
