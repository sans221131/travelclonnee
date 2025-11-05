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
    description: "Discover the perfect blend of tropical paradise and rich cultural heritage. Thailand captivates with its golden temples, stunning beaches, and warm hospitality.",
    topHighlights: [
      "Grand Palace and Temple of the Emerald Buddha",
      "Phi Phi Islands and pristine beaches",
      "Floating markets of Bangkok",
      "Ancient city of Ayutthaya",
      "Street food paradise",
      "Traditional Thai massage and wellness"
    ],
    quickFacts: {
      bestTime: "November to February",
      currency: "THB (Thai Baht)",
      language: "Thai (English in tourist areas)"
    },
    categories: {
      architecture: [
        "Grand Palace",
        "Wat Arun",
        "Wat Pho"
      ],
      shopping: [
        "Chatuchak Market",
        "MBK Center",
        "Night Markets"
      ],
      entertainment: [
        "Thai Boxing Shows",
        "Floating Markets",
        "Beach Clubs"
      ],
      culture: [
        "Buddhist Temples",
        "Traditional Dance",
        "Cooking Classes"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Beach Lovers",
        description: "Pristine beaches, crystal-clear waters, and world-class diving spots"
      },
      {
        icon: "family",
        title: "Culture Seekers",
        description: "Ancient temples, traditional ceremonies, and rich Buddhist heritage"
      },
      {
        icon: "shopping",
        title: "Food Enthusiasts",
        description: "Street food paradise with authentic Thai cuisine at every corner"
      },
      {
        icon: "luxury",
        title: "Wellness Travelers",
        description: "Spa retreats, yoga centers, and traditional healing practices"
      }
    ]
  },
  "london": {
    title: "London",
    subtitle: "History & Charm",
    image: "/images/london.jpg",
    description: "Walk through centuries of history in one of the world's most iconic cities. From royal palaces to modern art, London seamlessly blends tradition with innovation.",
    topHighlights: [
      "Buckingham Palace and Changing of the Guard",
      "Tower of London and Crown Jewels",
      "British Museum and world-class galleries",
      "Thames River cruises",
      "West End theatre district",
      "Traditional afternoon tea experience"
    ],
    quickFacts: {
      bestTime: "May to September",
      currency: "GBP (British Pound)",
      language: "English"
    },
    categories: {
      architecture: [
        "Big Ben & Parliament",
        "Tower Bridge",
        "St Paul's Cathedral"
      ],
      shopping: [
        "Oxford Street",
        "Harrods",
        "Camden Market"
      ],
      entertainment: [
        "West End Shows",
        "London Eye",
        "Madame Tussauds"
      ],
      culture: [
        "British Museum",
        "National Gallery",
        "Shakespeare's Globe"
      ]
    },
    perfectFor: [
      {
        icon: "family",
        title: "History Buffs",
        description: "Rich heritage, royal palaces, and museums spanning centuries"
      },
      {
        icon: "shopping",
        title: "Culture Enthusiasts",
        description: "World-renowned theatres, art galleries, and cultural institutions"
      },
      {
        icon: "luxury",
        title: "Urban Explorers",
        description: "Diverse neighborhoods, from historic Westminster to trendy Shoreditch"
      },
      {
        icon: "adventure",
        title: "Food Lovers",
        description: "Michelin-starred restaurants and multicultural culinary scene"
      }
    ]
  },
  "united-states": {
    title: "United States",
    subtitle: "Diversity & Adventure",
    image: "/images/united-states.jpg",
    description: "Explore a nation of endless possibilities, from bustling metropolises to breathtaking natural wonders. Every state offers unique experiences and unforgettable moments.",
    topHighlights: [
      "Grand Canyon and national parks",
      "New York City's iconic skyline",
      "Hollywood and entertainment capital",
      "Las Vegas entertainment hub",
      "San Francisco's Golden Gate Bridge",
      "Diverse landscapes from coast to coast"
    ],
    quickFacts: {
      bestTime: "Varies by region (Spring/Fall generally best)",
      currency: "USD (US Dollar)",
      language: "English (Spanish widely spoken)"
    },
    categories: {
      architecture: [
        "Empire State Building",
        "Golden Gate Bridge",
        "White House"
      ],
      shopping: [
        "Fifth Avenue NYC",
        "Rodeo Drive LA",
        "Outlet Malls"
      ],
      entertainment: [
        "Broadway Shows",
        "Universal Studios",
        "Las Vegas Shows"
      ],
      culture: [
        "Smithsonian Museums",
        "Hollywood",
        "Music Scenes"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Nature Enthusiasts",
        description: "National parks, diverse landscapes from deserts to mountains"
      },
      {
        icon: "family",
        title: "City Explorers",
        description: "Vibrant metropolises like NYC, LA, Chicago, and San Francisco"
      },
      {
        icon: "shopping",
        title: "Entertainment Seekers",
        description: "Theme parks, casinos, concerts, and world-class entertainment"
      },
      {
        icon: "luxury",
        title: "Road Trippers",
        description: "Epic road trips on iconic routes like Route 66"
      }
    ]
  },
  "bali": {
    title: "Bali",
    subtitle: "Tropical Paradise",
    image: "/images/bali.jpg",
    description: "Find your slice of paradise on the Island of the Gods. Bali enchants visitors with its lush rice terraces, ancient temples, and world-class beaches.",
    topHighlights: [
      "Tegalalang Rice Terraces",
      "Sacred Monkey Forest Sanctuary",
      "Ancient temple complexes",
      "World-class surfing beaches",
      "Traditional Balinese ceremonies",
      "Yoga and wellness retreats"
    ],
    quickFacts: {
      bestTime: "April to October (Dry Season)",
      currency: "IDR (Indonesian Rupiah)",
      language: "Indonesian, Balinese (English in tourist areas)"
    },
    categories: {
      architecture: [
        "Tanah Lot Temple",
        "Uluwatu Temple",
        "Besakih Temple"
      ],
      shopping: [
        "Ubud Art Market",
        "Seminyak Boutiques",
        "Traditional Crafts"
      ],
      entertainment: [
        "Kecak Dance Shows",
        "Beach Clubs",
        "Water Sports"
      ],
      culture: [
        "Temple Ceremonies",
        "Traditional Dance",
        "Batik Workshops"
      ]
    },
    perfectFor: [
      {
        icon: "luxury",
        title: "Wellness Seekers",
        description: "Yoga retreats, spa treatments, and spiritual healing experiences"
      },
      {
        icon: "adventure",
        title: "Beach & Surf Lovers",
        description: "World-class surf spots and pristine tropical beaches"
      },
      {
        icon: "family",
        title: "Culture Explorers",
        description: "Ancient temples, traditional ceremonies, and rich Balinese heritage"
      },
      {
        icon: "shopping",
        title: "Nature Enthusiasts",
        description: "Rice terraces, waterfalls, and lush tropical landscapes"
      }
    ]
  },
  "switzerland": {
    title: "Switzerland",
    subtitle: "Alps & Serenity",
    image: "/images/switzerland.jpg",
    description: "Immerse yourself in Alpine beauty and Swiss precision. From snow-capped peaks to pristine lakes, Switzerland is a haven for nature lovers and adventure seekers.",
    topHighlights: [
      "Jungfraujoch - Top of Europe",
      "Scenic train journeys (Glacier Express)",
      "Matterhorn mountain views",
      "Pristine Alpine lakes",
      "World-famous Swiss chocolate",
      "Charming medieval towns"
    ],
    quickFacts: {
      bestTime: "December-March (Skiing), June-September (Hiking)",
      currency: "CHF (Swiss Franc)",
      language: "German, French, Italian, Romansh"
    },
    categories: {
      architecture: [
        "Chapel Bridge Lucerne",
        "Chillon Castle",
        "Old Town Bern"
      ],
      shopping: [
        "Swiss Watches",
        "Chocolate Shops",
        "Luxury Boutiques"
      ],
      entertainment: [
        "Skiing & Snowboarding",
        "Scenic Train Rides",
        "Mountain Hiking"
      ],
      culture: [
        "Swiss Museums",
        "Traditional Festivals",
        "Alpine Villages"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Outdoor Adventurers",
        description: "Skiing, hiking, and mountaineering in the stunning Alps"
      },
      {
        icon: "luxury",
        title: "Luxury Travelers",
        description: "Premium hotels, fine dining, and world-class Swiss hospitality"
      },
      {
        icon: "family",
        title: "Nature Lovers",
        description: "Breathtaking mountains, crystal-clear lakes, and pristine landscapes"
      },
      {
        icon: "shopping",
        title: "Train Enthusiasts",
        description: "Scenic railway journeys through spectacular mountain scenery"
      }
    ]
  },
  "paris": {
    title: "Paris",
    subtitle: "Romance & Art",
    image: "/images/paris.jpg",
    description: "Fall in love with the City of Light. Paris captivates with its timeless elegance, world-renowned art, and unmatched culinary scene.",
    topHighlights: [
      "Eiffel Tower and Champ de Mars",
      "Louvre Museum and Mona Lisa",
      "Notre-Dame Cathedral",
      "Charming Montmartre district",
      "Seine River cruises",
      "World-class French cuisine"
    ],
    quickFacts: {
      bestTime: "April to June, September to October",
      currency: "EUR (Euro)",
      language: "French (English in tourist areas)"
    },
    categories: {
      architecture: [
        "Eiffel Tower",
        "Arc de Triomphe",
        "Sacré-Cœur"
      ],
      shopping: [
        "Champs-Élysées",
        "Le Marais",
        "Galeries Lafayette"
      ],
      entertainment: [
        "Moulin Rouge",
        "Seine Cruises",
        "Disneyland Paris"
      ],
      culture: [
        "Louvre Museum",
        "Musée d'Orsay",
        "Versailles Palace"
      ]
    },
    perfectFor: [
      {
        icon: "luxury",
        title: "Romantic Couples",
        description: "Iconic landmarks, intimate cafés, and enchanting atmosphere"
      },
      {
        icon: "family",
        title: "Art & History Lovers",
        description: "World-famous museums, galleries, and architectural masterpieces"
      },
      {
        icon: "shopping",
        title: "Fashion Enthusiasts",
        description: "Haute couture, designer boutiques, and trendy shopping districts"
      },
      {
        icon: "adventure",
        title: "Food Connoisseurs",
        description: "Michelin-starred restaurants, bakeries, and authentic French cuisine"
      }
    ]
  },
  "bhutan": {
    title: "Bhutan",
    subtitle: "Himalayan Kingdom",
    image: "/images/bhutan.png",
    description: "Journey to the last Himalayan kingdom where happiness is measured differently. Bhutan offers pristine nature, ancient monasteries, and profound spiritual experiences.",
    topHighlights: [
      "Tiger's Nest Monastery (Paro Taktsang)",
      "Punakha Dzong fortress",
      "Gross National Happiness philosophy",
      "Pristine Himalayan landscapes",
      "Traditional Buddhist culture",
      "Archery - national sport"
    ],
    quickFacts: {
      bestTime: "March to May, September to November",
      currency: "BTN (Bhutanese Ngultrum)",
      language: "Dzongkha (English widely spoken)"
    },
    categories: {
      architecture: [
        "Tiger's Nest",
        "Punakha Dzong",
        "Trongsa Dzong"
      ],
      shopping: [
        "Traditional Handicrafts",
        "Thangka Paintings",
        "Handwoven Textiles"
      ],
      entertainment: [
        "Archery Matches",
        "Traditional Festivals",
        "Trekking Routes"
      ],
      culture: [
        "Buddhist Monasteries",
        "Masked Dance Festivals",
        "Traditional Ceremonies"
      ]
    },
    perfectFor: [
      {
        icon: "family",
        title: "Spiritual Seekers",
        description: "Buddhist monasteries, meditation retreats, and spiritual traditions"
      },
      {
        icon: "adventure",
        title: "Nature Lovers",
        description: "Pristine Himalayan landscapes and untouched natural beauty"
      },
      {
        icon: "luxury",
        title: "Culture Enthusiasts",
        description: "Unique traditions, festivals, and the philosophy of Gross National Happiness"
      },
      {
        icon: "shopping",
        title: "Trekking Adventurers",
        description: "Scenic mountain trails and high-altitude trekking experiences"
      }
    ]
  },
  "maldives": {
    title: "Maldives",
    subtitle: "Crystal Waters",
    image: "/images/maldives.jpg",
    description: "Experience paradise on Earth in this tropical island nation. The Maldives dazzles with its crystal-clear waters, vibrant coral reefs, and luxurious overwater villas.",
    topHighlights: [
      "Overwater bungalows and luxury resorts",
      "World-class diving and snorkeling",
      "Bioluminescent beaches",
      "Private island experiences",
      "Underwater restaurants",
      "Marine life encounters (manta rays, whale sharks)"
    ],
    quickFacts: {
      bestTime: "November to April (Dry Season)",
      currency: "MVR (Maldivian Rufiyaa)",
      language: "Dhivehi (English widely spoken)"
    },
    categories: {
      architecture: [
        "Overwater Villas",
        "Underwater Suites",
        "Luxury Resorts"
      ],
      shopping: [
        "Local Handicrafts",
        "Resort Boutiques",
        "Malé Markets"
      ],
      entertainment: [
        "Water Sports",
        "Sunset Cruises",
        "Spa Treatments"
      ],
      culture: [
        "Local Island Visits",
        "Traditional Bodu Beru",
        "Islamic Heritage"
      ]
    },
    perfectFor: [
      {
        icon: "luxury",
        title: "Honeymooners",
        description: "Romantic overwater villas, private beaches, and ultimate privacy"
      },
      {
        icon: "adventure",
        title: "Divers & Snorkelers",
        description: "Vibrant coral reefs, diverse marine life, and clear waters"
      },
      {
        icon: "family",
        title: "Luxury Seekers",
        description: "Ultra-luxurious resorts with world-class amenities"
      },
      {
        icon: "shopping",
        title: "Beach Lovers",
        description: "Pristine white sand beaches and turquoise lagoons"
      }
    ]
  },
  "kerala": {
    title: "Kerala",
    subtitle: "God's Own Country",
    image: "/images/kerala.jpg",
    description: "Discover India's tropical paradise with serene backwaters, lush greenery, and rich cultural traditions. Kerala offers a perfect blend of relaxation and exploration.",
    topHighlights: [
      "Houseboat cruises in backwaters",
      "Ayurvedic wellness treatments",
      "Tea plantations of Munnar",
      "Periyar Wildlife Sanctuary",
      "Traditional Kathakali dance",
      "Pristine beaches of Kovalam"
    ],
    quickFacts: {
      bestTime: "October to March",
      currency: "INR (Indian Rupee)",
      language: "Malayalam (English, Hindi widely spoken)"
    },
    categories: {
      architecture: [
        "Padmanabhaswamy Temple",
        "Mattancherry Palace",
        "Hill Stations"
      ],
      shopping: [
        "Spice Markets",
        "Handicrafts",
        "Tea & Coffee"
      ],
      entertainment: [
        "Kathakali Shows",
        "Houseboat Stays",
        "Beach Activities"
      ],
      culture: [
        "Ayurvedic Centers",
        "Traditional Villages",
        "Temples & Churches"
      ]
    },
    perfectFor: [
      {
        icon: "luxury",
        title: "Wellness Seekers",
        description: "Authentic Ayurvedic treatments and rejuvenation therapies"
      },
      {
        icon: "family",
        title: "Nature Lovers",
        description: "Backwaters, tea gardens, wildlife sanctuaries, and beaches"
      },
      {
        icon: "adventure",
        title: "Cultural Explorers",
        description: "Traditional art forms, festivals, and local cuisine"
      },
      {
        icon: "shopping",
        title: "Peaceful Travelers",
        description: "Serene houseboats and tranquil natural surroundings"
      }
    ]
  },
  "assam": {
    title: "Assam",
    subtitle: "Tea Gardens & Wildlife",
    image: "/images/assam.jpg",
    description: "Explore the land of tea gardens and one-horned rhinos. Assam enchants with its verdant landscapes, diverse wildlife, and vibrant Assamese culture.",
    topHighlights: [
      "Kaziranga National Park (UNESCO Site)",
      "Tea garden tours and tastings",
      "Brahmaputra river cruises",
      "Kamakhya Temple",
      "One-horned rhinoceros sightings",
      "Traditional Assamese silk weaving"
    ],
    quickFacts: {
      bestTime: "November to April",
      currency: "INR (Indian Rupee)",
      language: "Assamese (Hindi, English spoken)"
    },
    categories: {
      architecture: [
        "Kamakhya Temple",
        "Talatal Ghar",
        "Ahom Monuments"
      ],
      shopping: [
        "Assam Tea",
        "Silk Products",
        "Handicrafts"
      ],
      entertainment: [
        "Wildlife Safaris",
        "River Cruises",
        "Bihu Dance Shows"
      ],
      culture: [
        "Tea Estates",
        "Tribal Villages",
        "Traditional Festivals"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Wildlife Enthusiasts",
        description: "Home to one-horned rhinos, elephants, and diverse bird species"
      },
      {
        icon: "family",
        title: "Tea Lovers",
        description: "Visit world-famous tea estates and learn about tea production"
      },
      {
        icon: "luxury",
        title: "Nature Explorers",
        description: "Lush green landscapes, river islands, and natural beauty"
      },
      {
        icon: "shopping",
        title: "Culture Seekers",
        description: "Unique Assamese traditions, festivals, and handicrafts"
      }
    ]
  },
  "himachal": {
    title: "Himachal",
    subtitle: "Mountain Retreat",
    image: "/images/himachal.jpg",
    description: "Escape to the mountains of Himachal Pradesh. From adventure sports to spiritual retreats, this Himalayan state offers breathtaking views and peaceful sanctuaries.",
    topHighlights: [
      "Shimla - Queen of Hills",
      "Manali adventure activities",
      "Dharamshala and McLeod Ganj",
      "Rohtang Pass scenic beauty",
      "Tibetan monasteries",
      "Paragliding in Bir Billing"
    ],
    quickFacts: {
      bestTime: "March to June, October to February",
      currency: "INR (Indian Rupee)",
      language: "Hindi, Pahari (English widely spoken)"
    },
    categories: {
      architecture: [
        "Colonial Buildings",
        "Tibetan Monasteries",
        "Traditional Temples"
      ],
      shopping: [
        "Woollen Shawls",
        "Tibetan Handicrafts",
        "Local Souvenirs"
      ],
      entertainment: [
        "Paragliding",
        "Skiing",
        "River Rafting"
      ],
      culture: [
        "Buddhist Monasteries",
        "Hill Temples",
        "Local Festivals"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Adventure Seekers",
        description: "Trekking, paragliding, skiing, and mountain biking opportunities"
      },
      {
        icon: "family",
        title: "Hill Station Lovers",
        description: "Scenic mountain towns like Shimla, Manali, and Dalhousie"
      },
      {
        icon: "luxury",
        title: "Spiritual Travelers",
        description: "Tibetan Buddhist culture and peaceful meditation centers"
      },
      {
        icon: "shopping",
        title: "Nature Photographers",
        description: "Snow-capped peaks, valleys, and stunning Himalayan landscapes"
      }
    ]
  },
  "meghalaya": {
    title: "Meghalaya",
    subtitle: "Abode of Clouds",
    image: "/images/meghalaya.jpg",
    description: "Visit one of the wettest places on Earth, where nature's beauty knows no bounds. Meghalaya captivates with its living root bridges, waterfalls, and misty hills.",
    topHighlights: [
      "Living root bridges of Cherrapunji",
      "Cleanest village - Mawlynnong",
      "Nohkalikai Falls - India's tallest plunge",
      "Crystal clear Umngot River",
      "Caves and cave systems",
      "Shillong - Scotland of the East"
    ],
    quickFacts: {
      bestTime: "October to May",
      currency: "INR (Indian Rupee)",
      language: "Khasi, Garo (English, Hindi spoken)"
    },
    categories: {
      architecture: [
        "Living Root Bridges",
        "Tribal Villages",
        "Colonial Churches"
      ],
      shopping: [
        "Bamboo Crafts",
        "Tribal Handicrafts",
        "Local Markets"
      ],
      entertainment: [
        "Waterfall Trekking",
        "Caving Expeditions",
        "River Activities"
      ],
      culture: [
        "Tribal Culture",
        "Music Scene",
        "Traditional Festivals"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Nature Enthusiasts",
        description: "Unique living root bridges, waterfalls, and lush landscapes"
      },
      {
        icon: "family",
        title: "Adventure Trekkers",
        description: "Challenging treks to remote villages and natural wonders"
      },
      {
        icon: "luxury",
        title: "Offbeat Travelers",
        description: "Unexplored destinations and unique tribal culture"
      },
      {
        icon: "shopping",
        title: "Photography Lovers",
        description: "Misty hills, dramatic waterfalls, and scenic landscapes"
      }
    ]
  },
  "mysore": {
    title: "Mysore",
    subtitle: "Royal Heritage",
    image: "/images/mysore.jpg",
    description: "Step into royal splendor in this historic city of palaces. Mysore charms visitors with its rich heritage, magnificent architecture, and cultural traditions.",
    topHighlights: [
      "Mysore Palace - architectural marvel",
      "Chamundi Hills and temple",
      "Brindavan Gardens musical fountain",
      "Traditional silk sarees shopping",
      "Mysore Zoo - one of India's best",
      "Sandalwood products and incense"
    ],
    quickFacts: {
      bestTime: "October to March",
      currency: "INR (Indian Rupee)",
      language: "Kannada (English, Hindi spoken)"
    },
    categories: {
      architecture: [
        "Mysore Palace",
        "Jaganmohan Palace",
        "St. Philomena's Church"
      ],
      shopping: [
        "Silk Sarees",
        "Sandalwood Items",
        "Mysore Paintings"
      ],
      entertainment: [
        "Dasara Festival",
        "Musical Fountains",
        "Palace Light Show"
      ],
      culture: [
        "Royal Heritage",
        "Classical Dance",
        "Traditional Arts"
      ]
    },
    perfectFor: [
      {
        icon: "family",
        title: "History Buffs",
        description: "Royal palaces, museums, and rich cultural heritage"
      },
      {
        icon: "luxury",
        title: "Architecture Lovers",
        description: "Indo-Saracenic architecture and magnificent monuments"
      },
      {
        icon: "shopping",
        title: "Shopping Enthusiasts",
        description: "Famous for silk sarees, sandalwood, and traditional crafts"
      },
      {
        icon: "adventure",
        title: "Festival Seekers",
        description: "Grand Dasara celebrations with royal processions"
      }
    ]
  },
  "rajasthan": {
    title: "Rajasthan",
    subtitle: "Desert Majesty",
    image: "/images/rajasthan.jpg",
    description: "Experience the grandeur of India's desert kingdom. Rajasthan dazzles with its majestic forts, vibrant culture, and tales of royal valor.",
    topHighlights: [
      "Magnificent forts and palaces",
      "Thar Desert camel safaris",
      "City Palace complexes",
      "Colorful markets and bazaars",
      "Traditional Rajasthani cuisine",
      "Folk music and dance performances"
    ],
    quickFacts: {
      bestTime: "October to March",
      currency: "INR (Indian Rupee)",
      language: "Hindi, Rajasthani (English in tourist areas)"
    },
    categories: {
      architecture: [
        "Amber Fort",
        "City Palaces",
        "Hawa Mahal"
      ],
      shopping: [
        "Handicrafts",
        "Jewelry & Gemstones",
        "Traditional Textiles"
      ],
      entertainment: [
        "Desert Safaris",
        "Folk Performances",
        "Palace Hotels"
      ],
      culture: [
        "Royal Heritage",
        "Traditional Arts",
        "Colorful Festivals"
      ]
    },
    perfectFor: [
      {
        icon: "family",
        title: "History Enthusiasts",
        description: "Majestic forts, palaces, and tales of Rajput warriors"
      },
      {
        icon: "adventure",
        title: "Desert Explorers",
        description: "Camel safaris, sand dunes, and desert camping"
      },
      {
        icon: "luxury",
        title: "Luxury Travelers",
        description: "Stay in heritage hotels and former royal palaces"
      },
      {
        icon: "shopping",
        title: "Culture Seekers",
        description: "Vibrant festivals, folk arts, and traditional crafts"
      }
    ]
  },
  "uttarakhand": {
    title: "Uttarakhand",
    subtitle: "Spiritual Heights",
    image: "/images/uttarakhand.jpg",
    description: "Find spiritual solace in the land of gods. Uttarakhand offers sacred pilgrimage sites, yoga retreats, and stunning Himalayan vistas.",
    topHighlights: [
      "Char Dham pilgrimage circuit",
      "Rishikesh - Yoga Capital of the World",
      "Valley of Flowers National Park",
      "Jim Corbett National Park",
      "Ganga Aarti ceremonies",
      "Adventure sports in Rishikesh"
    ],
    quickFacts: {
      bestTime: "April to June, September to November",
      currency: "INR (Indian Rupee)",
      language: "Hindi, Garhwali, Kumaoni (English spoken)"
    },
    categories: {
      architecture: [
        "Ancient Temples",
        "Ashrams",
        "Hill Town Churches"
      ],
      shopping: [
        "Woollen Products",
        "Spiritual Items",
        "Local Handicrafts"
      ],
      entertainment: [
        "River Rafting",
        "Trekking",
        "Wildlife Safaris"
      ],
      culture: [
        "Yoga Retreats",
        "Temple Rituals",
        "Spiritual Learning"
      ]
    },
    perfectFor: [
      {
        icon: "family",
        title: "Spiritual Seekers",
        description: "Sacred temples, ashrams, and ancient pilgrimage sites"
      },
      {
        icon: "luxury",
        title: "Yoga Enthusiasts",
        description: "World-renowned yoga and meditation centers in Rishikesh"
      },
      {
        icon: "adventure",
        title: "Adventure Lovers",
        description: "River rafting, trekking, and mountain expeditions"
      },
      {
        icon: "shopping",
        title: "Nature Admirers",
        description: "Himalayan peaks, national parks, and pristine valleys"
      }
    ]
  },
  "ladakh": {
    title: "Ladakh",
    subtitle: "Cold Desert Beauty",
    image: "/images/ladakh.jpg",
    description: "Journey to the roof of the world in this high-altitude desert. Ladakh mesmerizes with its stark beauty, Buddhist monasteries, and adventure opportunities.",
    topHighlights: [
      "Pangong Lake - stunning blue waters",
      "Nubra Valley and double-humped camels",
      "Ancient Buddhist monasteries",
      "Magnetic Hill phenomenon",
      "Khardung La - world's highest motorable pass",
      "Leh Palace and market"
    ],
    quickFacts: {
      bestTime: "May to September",
      currency: "INR (Indian Rupee)",
      language: "Ladakhi, Hindi (English widely spoken)"
    },
    categories: {
      architecture: [
        "Buddhist Monasteries",
        "Leh Palace",
        "Ancient Stupas"
      ],
      shopping: [
        "Tibetan Handicrafts",
        "Pashmina Shawls",
        "Prayer Flags"
      ],
      entertainment: [
        "Mountain Biking",
        "Motorbiking Tours",
        "Trekking Routes"
      ],
      culture: [
        "Monastery Festivals",
        "Buddhist Culture",
        "Local Traditions"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Adventure Bikers",
        description: "Epic motorbiking routes through high mountain passes"
      },
      {
        icon: "family",
        title: "Nature Photographers",
        description: "Dramatic landscapes, crystal-clear lakes, and barren mountains"
      },
      {
        icon: "luxury",
        title: "Spiritual Explorers",
        description: "Ancient Buddhist monasteries and peaceful meditation"
      },
      {
        icon: "shopping",
        title: "Thrill Seekers",
        description: "High-altitude trekking and challenging expeditions"
      }
    ]
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
