export const runtime = "nodejs";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivitiesByDestinationId } from "@/lib/db";
import fs from "fs";
import path from "path";
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
  "bali": {
    title: "Bali",
    subtitle: "Tropical Paradise",
    image: "/countries/bali.jpg",
    description: "Bali is an Indonesian island paradise known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs—famous for wellness retreats and vibrant culture.",
    topHighlights: [
      "Rice terraces of Tegallalang",
      "Sacred temples and traditional ceremonies",
      "World-class beaches and surf spots",
      "Ubud arts and cultural center",
      "Mount Batur sunrise trekking",
      "Yoga and wellness retreats"
    ],
    quickFacts: {
      bestTime: "April to October",
      currency: "IDR (Indonesian Rupiah)",
      language: "Indonesian, Balinese"
    },
    categories: {
      architecture: ["Tanah Lot Temple", "Uluwatu Temple", "Besakih Temple"],
      shopping: ["Ubud Art Market", "Seminyak Boutiques", "Traditional Crafts"],
      entertainment: ["Kecak Dance Shows", "Beach Clubs", "Water Sports"],
      culture: ["Temple Ceremonies", "Traditional Dance", "Batik Workshops"]
    },
    perfectFor: [
      { icon: "luxury", title: "Wellness Seekers", description: "Yoga and spa retreats" },
      { icon: "adventure", title: "Beach Lovers", description: "Surfing and sun" },
      { icon: "family", title: "Culture Explorers", description: "Temples and traditions" },
      { icon: "shopping", title: "Nature Enthusiasts", description: "Rice terraces and beaches" }
    ]
  },
  "united-states": {
    title: "United States",
    subtitle: "Diversity & Adventure",
    image: "/countries/united-states.jpg",
    description: "The United States offers coast-to-coast variety: major cities, national parks, beaches, and cultural hubs—ideal for road trips and immersive city stays.",
    topHighlights: [
      "Grand Canyon and Yellowstone National Parks",
      "New York City skyline and culture",
      "Los Angeles and Hollywood",
      "San Francisco's Golden Gate Bridge",
      "Epic road trips across diverse landscapes",
      "World-class entertainment and dining"
    ],
    quickFacts: {
      bestTime: "Varies by region (Spring/Fall generally best)",
      currency: "USD (US Dollar)",
      language: "English"
    },
    categories: {
      architecture: ["Empire State Building", "Golden Gate Bridge", "White House"],
      shopping: ["Fifth Avenue NYC", "Rodeo Drive LA", "Outlet Malls"],
      entertainment: ["Broadway Shows", "Universal Studios", "Las Vegas Shows"],
      culture: ["Smithsonian Museums", "Hollywood", "Music Scenes"]
    },
    perfectFor: [
      { icon: "adventure", title: "Road Trippers", description: "Epic scenic drives" },
      { icon: "family", title: "City Lovers", description: "Cultural and food scenes" },
      { icon: "shopping", title: "Nature Enthusiasts", description: "National parks and landscapes" },
      { icon: "luxury", title: "Entertainment Seekers", description: "Theme parks and shows" }
    ]
  },
  "dubai": {
    title: "Dubai",
    subtitle: "Luxury & Architecture",
    image: "/countries/dubai.jpg",
    description: "Dubai is a modern metropolis with iconic skyscrapers, luxury shopping, desert adventures and vibrant cultural offerings.",
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
    image: "/countries/thailand.jpg",
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
    image: "/countries/london.jpg",
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
  "bhutan": {
    title: "Bhutan",
    subtitle: "Himalayan Kingdom",
    image: "/countries/bhutan.png",
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
    image: "/countries/maldives.jpg",
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
    image: "/countries/kerala.jpg",
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
    image: "/countries/assam.jpg",
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
    image: "/countries/himachal.jpg",
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
    image: "/countries/meghalaya.jpg",
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
    image: "/countries/mysore.jpg",
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
    image: "/countries/rajasthan.jpg",
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
    image: "/countries/uttarakhand.jpg",
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
    image: "/countries/ladakh.jpg",
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
  },
  "italy": {
    title: "Italy",
    subtitle: "Art, Food & Historic Cities",
    image: "/countries/italy.jpg",
    description: "Italy is famed for its art, food, historic cities and coastal regions. From the ancient ruins of Rome to the romantic canals of Venice and the rolling hills of Tuscany, Italy offers timeless beauty.",
    topHighlights: [
      "Colosseum and Roman Forum",
      "Venice canals and gondola rides",
      "Tuscany wine country and rolling hills",
      "Vatican Museums and Sistine Chapel",
      "Florence Renaissance art and architecture",
      "Amalfi Coast scenic drives"
    ],
    quickFacts: {
      bestTime: "April to June, September to October",
      currency: "EUR (Euro)",
      language: "Italian"
    },
    categories: {
      architecture: [
        "Colosseum",
        "St. Peter's Basilica",
        "Duomo Florence"
      ],
      shopping: [
        "Fashion Boutiques",
        "Italian Markets",
        "Artisan Crafts"
      ],
      entertainment: [
        "Opera Houses",
        "Wine Tours",
        "Coastal Cruises"
      ],
      culture: [
        "Vatican Museums",
        "Uffizi Gallery",
        "Historic Centers"
      ]
    },
    perfectFor: [
      {
        icon: "family",
        title: "Art & History Lovers",
        description: "Renaissance masterpieces, ancient ruins, and world-class museums"
      },
      {
        icon: "shopping",
        title: "Food & Wine Enthusiasts",
        description: "Authentic Italian cuisine, wine regions, and culinary traditions"
      },
      {
        icon: "luxury",
        title: "Romantic Couples",
        description: "Enchanting cities, scenic coastlines, and charming villages"
      },
      {
        icon: "adventure",
        title: "Culture Seekers",
        description: "Historic architecture, local traditions, and vibrant city life"
      }
    ]
  },
  "jamaica": {
    title: "Jamaica",
    subtitle: "Reggae, Beaches & Culture",
    image: "/countries/jamiaca.jpg",
    description: "Jamaica offers reggae culture, mountain scenery and Caribbean beaches. Experience the vibrant spirit of the island through its music, cuisine, and warm hospitality.",
    topHighlights: [
      "Negril's Seven Mile Beach",
      "Dunn's River Falls climbing experience",
      "Bob Marley Museum and reggae heritage",
      "Blue Mountains coffee plantations",
      "Montego Bay marine park snorkeling",
      "Jerk cuisine and local rum tastings"
    ],
    quickFacts: {
      bestTime: "November to April",
      currency: "JMD (Jamaican Dollar)",
      language: "English"
    },
    categories: {
      architecture: [
        "Rose Hall Great House",
        "Devon House",
        "Historic Plantations"
      ],
      shopping: [
        "Craft Markets",
        "Rum Distilleries",
        "Local Art"
      ],
      entertainment: [
        "Water Sports",
        "Reggae Shows",
        "Beach Clubs"
      ],
      culture: [
        "Bob Marley Museum",
        "Music Festivals",
        "Local Cuisine"
      ]
    },
    perfectFor: [
      {
        icon: "adventure",
        title: "Beach Lovers",
        description: "Pristine beaches, crystal-clear waters, and water sports"
      },
      {
        icon: "family",
        title: "Music Enthusiasts",
        description: "Reggae culture, live performances, and musical heritage"
      },
      {
        icon: "shopping",
        title: "Adventure Seekers",
        description: "Waterfalls, river rafting, and mountain exploration"
      },
      {
        icon: "luxury",
        title: "Food & Culture Lovers",
        description: "Jerk cuisine, coffee tours, and vibrant local traditions"
      }
    ]
  },
  "france": {
    title: "France",
    subtitle: "Art, Cuisine & Wine",
    image: "/countries/france.jpg",
    description: "France offers world-class art, cuisine, vineyards, coastal regions and historic towns.",
    topHighlights: [
      "Eiffel Tower and Paris landmarks",
      "Louvre Museum and art galleries",
      "Bordeaux and Burgundy wine regions",
      "French Riviera coastline",
      "Provence lavender fields",
      "Versailles Palace gardens"
    ],
    quickFacts: {
      bestTime: "April to June, Sep to Oct",
      currency: "EUR (Euro)",
      language: "French"
    },
    categories: {
      architecture: ["Eiffel Tower", "Louvre", "Notre-Dame"],
      shopping: ["Champs-Élysées", "Le Marais", "Local Markets"],
      entertainment: ["Seine Cruises", "Cabaret Shows", "Wine Tours"],
      culture: ["Museums", "Art Galleries", "Historic Sites"]
    },
    perfectFor: [
      { icon: "luxury", title: "Foodies", description: "Cuisine and wine" },
      { icon: "family", title: "Art Lovers", description: "Museums and history" },
      { icon: "shopping", title: "Romance Seekers", description: "Paris and countryside" },
      { icon: "adventure", title: "Wine Enthusiasts", description: "Vineyard tours" }
    ]
  },
  "japan": {
    title: "Japan",
    subtitle: "Tradition & Technology",
    image: "/countries/japan.jpg",
    description: "Japan mixes ancient traditions and cutting-edge modern culture from Tokyo to Kyoto.",
    topHighlights: [
      "Tokyo's vibrant districts and tech",
      "Kyoto temples and gardens",
      "Mount Fuji iconic views",
      "Osaka street food culture",
      "Traditional hot spring resorts",
      "Cherry blossom season"
    ],
    quickFacts: {
      bestTime: "March to May, Sep to Nov",
      currency: "JPY (Japanese Yen)",
      language: "Japanese"
    },
    categories: {
      architecture: ["Temples", "Shrines", "Modern Tokyo"],
      shopping: ["Shibuya", "Akihabara", "Traditional Markets"],
      entertainment: ["Sumo Wrestling", "Karaoke", "Theme Parks"],
      culture: ["Tea Ceremonies", "Temples", "Museums"]
    },
    perfectFor: [
      { icon: "family", title: "Culture Seekers", description: "Temples and heritage" },
      { icon: "shopping", title: "Foodies", description: "Sushi and regional cuisine" },
      { icon: "adventure", title: "Tech Enthusiasts", description: "Modern Tokyo experiences" },
      { icon: "luxury", title: "Wellness Travelers", description: "Hot springs and relaxation" }
    ]
  },
  "turkey": {
    title: "Türkiye",
    subtitle: "East Meets West",
    image: "/countries/turkey.jpg",
    description: "Türkiye bridges Europe and Asia with rich history, bazaars and unique landscapes.",
    topHighlights: [
      "Hagia Sophia and Blue Mosque",
      "Cappadocia hot air balloons",
      "Ancient ruins of Ephesus",
      "Turkish baths and hammams",
      "Grand Bazaar shopping",
      "Turquoise Coast beaches"
    ],
    quickFacts: {
      bestTime: "April to June, Sep to Oct",
      currency: "TRY (Turkish Lira)",
      language: "Turkish"
    },
    categories: {
      architecture: ["Hagia Sophia", "Blue Mosque", "Topkapi Palace"],
      shopping: ["Grand Bazaar", "Spice Market", "Carpet Shops"],
      entertainment: ["Hot Air Balloons", "Boat Cruises", "Turkish Nights"],
      culture: ["Historic Sites", "Museums", "Traditional Baths"]
    },
    perfectFor: [
      { icon: "family", title: "History Buffs", description: "Ancient sites" },
      { icon: "adventure", title: "Adventure Seekers", description: "Ballooning and trekking" },
      { icon: "shopping", title: "Shoppers", description: "Bazaars and markets" },
      { icon: "luxury", title: "Cultural Explorers", description: "Rich heritage" }
    ]
  },
  "china": {
    title: "China",
    subtitle: "Ancient & Modern",
    image: "/countries/china.jpg",
    description: "China is vast, with dynastic history, iconic landmarks and diverse regions.",
    topHighlights: [
      "Great Wall of China",
      "Terracotta Army in Xi'an",
      "Forbidden City Beijing",
      "Shanghai modern skyline",
      "Li River cruises Guilin",
      "Traditional Chinese gardens"
    ],
    quickFacts: {
      bestTime: "Apr-May, Sep-Oct",
      currency: "CNY (Renminbi)",
      language: "Mandarin"
    },
    categories: {
      architecture: ["Great Wall", "Forbidden City", "Modern Towers"],
      shopping: ["Silk Markets", "Tea Shops", "Antiques"],
      entertainment: ["Acrobatic Shows", "River Cruises", "Theme Parks"],
      culture: ["Museums", "Temples", "Traditional Shows"]
    },
    perfectFor: [
      { icon: "family", title: "History Lovers", description: "Ancient sites and culture" },
      { icon: "shopping", title: "Food Enthusiasts", description: "Regional cuisines" },
      { icon: "adventure", title: "Adventure Seekers", description: "Wall hiking" },
      { icon: "luxury", title: "City Explorers", description: "Modern metropolises" }
    ]
  },
  "greece": {
    title: "Greece",
    subtitle: "Islands & History",
    image: "/countries/greece.jpg",
    description: "Greece combines ancient ruins, islands and Mediterranean cuisine.",
    topHighlights: [
      "Acropolis and Parthenon",
      "Santorini sunsets and white villages",
      "Mykonos beaches and nightlife",
      "Delphi ancient ruins",
      "Greek island hopping",
      "Traditional Greek tavernas"
    ],
    quickFacts: {
      bestTime: "May to Oct",
      currency: "EUR (Euro)",
      language: "Greek"
    },
    categories: {
      architecture: ["Acropolis", "Ancient Theaters", "Byzantine Churches"],
      shopping: ["Local Markets", "Olive Oil", "Handmade Crafts"],
      entertainment: ["Island Cruises", "Beach Clubs", "Traditional Dance"],
      culture: ["Archaeological Sites", "Museums", "Monasteries"]
    },
    perfectFor: [
      { icon: "family", title: "History Enthusiasts", description: "Classical ruins" },
      { icon: "adventure", title: "Beach Lovers", description: "Island hopping" },
      { icon: "shopping", title: "Food Lovers", description: "Mediterranean cuisine" },
      { icon: "luxury", title: "Romantics", description: "Santorini sunsets" }
    ]
  },
  "germany": {
    title: "Germany",
    subtitle: "Culture & Castles",
    image: "/countries/germany.webp",
    description: "Germany offers historic cities, alpine scenery and strong cultural traditions.",
    topHighlights: [
      "Berlin Wall and Brandenburg Gate",
      "Bavarian Alps and Neuschwanstein",
      "Munich beer gardens",
      "Rhine Valley castles",
      "Black Forest scenic drives",
      "Christmas markets"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "EUR (Euro)",
      language: "German"
    },
    categories: {
      architecture: ["Castles", "Cathedrals", "Modern Berlin"],
      shopping: ["Christmas Markets", "Designer Stores", "Local Crafts"],
      entertainment: ["Oktoberfest", "Beer Gardens", "Classical Music"],
      culture: ["Museums", "Historic Sites", "Art Galleries"]
    },
    perfectFor: [
      { icon: "family", title: "History Buffs", description: "Castles and museums" },
      { icon: "shopping", title: "Festival Lovers", description: "Oktoberfest and markets" },
      { icon: "adventure", title: "Nature Enthusiasts", description: "Alps and forests" },
      { icon: "luxury", title: "Culture Seekers", description: "Art and music" }
    ]
  },
  "netherlands": {
    title: "Netherlands",
    subtitle: "Canals & Culture",
    image: "/countries/netherlands.avif",
    description: "The Netherlands is known for canals, cycling, tulips and compact, walkable cities.",
    topHighlights: [
      "Amsterdam canal cruises",
      "Keukenhof tulip gardens",
      "Windmills of Kinderdijk",
      "Anne Frank House",
      "Van Gogh Museum",
      "Cycling through countryside"
    ],
    quickFacts: {
      bestTime: "April to May, Sep to Oct",
      currency: "EUR (Euro)",
      language: "Dutch"
    },
    categories: {
      architecture: ["Canal Houses", "Windmills", "Modern Design"],
      shopping: ["Flower Markets", "Cheese Shops", "Boutiques"],
      entertainment: ["Canal Cruises", "Museums", "Cycling Tours"],
      culture: ["Art Museums", "Historic Sites", "Festivals"]
    },
    perfectFor: [
      { icon: "family", title: "Art Lovers", description: "Museums and galleries" },
      { icon: "adventure", title: "Cyclists", description: "Bike-friendly routes" },
      { icon: "shopping", title: "Photographers", description: "Tulips and windmills" },
      { icon: "luxury", title: "City Explorers", description: "Amsterdam charm" }
    ]
  },
  "saudi-arabia": {
    title: "Saudi Arabia",
    subtitle: "Heritage & Modernity",
    image: "/countries/saudi.jpg",
    description: "Saudi Arabia offers historic sites, Red Sea coastlines and desert landscapes.",
    topHighlights: [
      "AlUla ancient rock formations",
      "Red Sea diving and beaches",
      "Riyadh modern architecture",
      "Madain Saleh archaeological site",
      "Edge of the World cliff views",
      "Traditional Souq experiences"
    ],
    quickFacts: {
      bestTime: "Nov to Mar",
      currency: "SAR (Saudi Riyal)",
      language: "Arabic"
    },
    categories: {
      architecture: ["Historic AlUla", "Modern Riyadh", "Traditional Forts"],
      shopping: ["Souqs", "Malls", "Traditional Crafts"],
      entertainment: ["Desert Adventures", "Water Sports", "Cultural Shows"],
      culture: ["Archaeological Sites", "Museums", "Heritage Villages"]
    },
    perfectFor: [
      { icon: "family", title: "Culture Seekers", description: "Heritage and archaeology" },
      { icon: "adventure", title: "Adventure Lovers", description: "Diving and desert" },
      { icon: "shopping", title: "History Enthusiasts", description: "Ancient sites" },
      { icon: "luxury", title: "Beach Goers", description: "Red Sea resorts" }
    ]
  },
  "vietnam": {
    title: "Vietnam",
    subtitle: "Culture & Nature",
    image: "/countries/vietnam.webp",
    description: "Vietnam stretches from rice terraces to vibrant cities and tropical coasts.",
    topHighlights: [
      "Ha Long Bay cruises",
      "Hanoi street food scene",
      "Hoi An ancient town",
      "Sapa rice terraces",
      "Mekong Delta tours",
      "Ho Chi Minh City energy"
    ],
    quickFacts: {
      bestTime: "Feb to Apr, Sep to Nov",
      currency: "VND (Vietnamese Dong)",
      language: "Vietnamese"
    },
    categories: {
      architecture: ["Ancient Towns", "Temples", "French Colonial"],
      shopping: ["Night Markets", "Tailor Shops", "Handicrafts"],
      entertainment: ["Water Puppets", "Cooking Classes", "Boat Tours"],
      culture: ["Historic Sites", "Museums", "Local Markets"]
    },
    perfectFor: [
      { icon: "shopping", title: "Budget Travelers", description: "Affordable travel with rich experiences" },
      { icon: "family", title: "Food Lovers", description: "Street food and regional specialties" },
      { icon: "adventure", title: "Adventure Seekers", description: "Trekking and cruises" },
      { icon: "luxury", title: "Culture Explorers", description: "Ancient heritage" }
    ]
  },
  "india": {
    title: "India",
    subtitle: "Diversity & Heritage",
    image: "/countries/india.jpg",
    description: "India offers vast cultural diversity, historic sites and varied landscapes.",
    topHighlights: [
      "Taj Mahal wonder of the world",
      "Rajasthan forts and palaces",
      "Kerala backwaters and houseboats",
      "Varanasi spiritual experiences",
      "Goa beaches and Portuguese heritage",
      "Himalayan mountain treks"
    ],
    quickFacts: {
      bestTime: "Oct to Mar",
      currency: "INR (Indian Rupee)",
      language: "Hindi, English"
    },
    categories: {
      architecture: ["Taj Mahal", "Amber Fort", "Temples"],
      shopping: ["Bazaars", "Textiles", "Handicrafts"],
      entertainment: ["Cultural Shows", "Festivals", "Bollywood"],
      culture: ["Temples", "Palaces", "Historic Sites"]
    },
    perfectFor: [
      { icon: "family", title: "Culture Seekers", description: "Temples, palaces and festivals" },
      { icon: "shopping", title: "Food Lovers", description: "Regional cuisines" },
      { icon: "adventure", title: "Spiritual Travelers", description: "Yoga and meditation" },
      { icon: "luxury", title: "Heritage Enthusiasts", description: "Historic monuments" }
    ]
  },
  "singapore": {
    title: "Singapore",
    subtitle: "Garden City",
    image: "/countries/singapore.webp",
    description: "City-state with urban nature, world-class dining and family attractions.",
    topHighlights: [
      "Marina Bay Sands and skyline",
      "Gardens by the Bay Supertrees",
      "Sentosa Island attractions",
      "Hawker center food culture",
      "Universal Studios theme park",
      "Night Safari wildlife experience"
    ],
    quickFacts: {
      bestTime: "Feb to Apr",
      currency: "SGD (Singapore Dollar)",
      language: "English, Mandarin"
    },
    categories: {
      architecture: ["Marina Bay", "Gardens by the Bay", "Modern Towers"],
      shopping: ["Orchard Road", "Malls", "Markets"],
      entertainment: ["Universal Studios", "Night Safari", "Sentosa"],
      culture: ["Museums", "Cultural Quarters", "Temples"]
    },
    perfectFor: [
      { icon: "family", title: "Families", description: "Safe attractions and parks" },
      { icon: "shopping", title: "Foodies", description: "Hawker cuisine" },
      { icon: "luxury", title: "Urban Explorers", description: "Modern city experiences" },
      { icon: "adventure", title: "Shoppers", description: "World-class malls" }
    ]
  },
  "south-africa": {
    title: "South Africa",
    subtitle: "Safari & Scenery",
    image: "/countries/southafrica.jpg",
    description: "South Africa is renowned for safaris, dramatic coastlines and vibrant cities.",
    topHighlights: [
      "Kruger National Park safaris",
      "Cape Town and Table Mountain",
      "Garden Route scenic drive",
      "Wine lands of Stellenbosch",
      "Robben Island historic site",
      "Diverse wildlife viewing"
    ],
    quickFacts: {
      bestTime: "Apr to Sep",
      currency: "ZAR (South African Rand)",
      language: "Multiple (English widely used)"
    },
    categories: {
      architecture: ["Cape Dutch", "Modern Cape Town", "Historic Sites"],
      shopping: ["Craft Markets", "Wine Estates", "Malls"],
      entertainment: ["Safari Drives", "Wine Tours", "Beach Activities"],
      culture: ["Museums", "Township Tours", "Art Galleries"]
    },
    perfectFor: [
      { icon: "adventure", title: "Safari Enthusiasts", description: "Big Five and private reserves" },
      { icon: "family", title: "Wine Lovers", description: "Vineyard tours" },
      { icon: "shopping", title: "Outdoor Adventurers", description: "Hiking and drives" },
      { icon: "luxury", title: "Beach Goers", description: "Coastal beauty" }
    ]
  },
  "australia": {
    title: "Australia",
    subtitle: "Reefs & Outback",
    image: "/countries/australia.webp",
    description: "Australia features reefs, coasts, Outback and cosmopolitan cities.",
    topHighlights: [
      "Great Barrier Reef diving",
      "Sydney Opera House and Harbour",
      "Uluru (Ayers Rock) in Outback",
      "Melbourne cultural scene",
      "Coastal drives and beaches",
      "Unique wildlife encounters"
    ],
    quickFacts: {
      bestTime: "Sep to Nov, Mar to May",
      currency: "AUD (Australian Dollar)",
      language: "English"
    },
    categories: {
      architecture: ["Sydney Opera House", "Modern Cities", "Historic Sites"],
      shopping: ["Markets", "Designer Stores", "Aboriginal Art"],
      entertainment: ["Wildlife Parks", "Surfing", "Wine Tours"],
      culture: ["Aboriginal Culture", "Museums", "Art Galleries"]
    },
    perfectFor: [
      { icon: "adventure", title: "Beach Lovers", description: "Surfing and coastal escapes" },
      { icon: "family", title: "Adventure Seekers", description: "Diving and outback trips" },
      { icon: "shopping", title: "Wildlife Enthusiasts", description: "Unique fauna" },
      { icon: "luxury", title: "City Explorers", description: "Sydney and Melbourne" }
    ]
  },
  "new-zealand": {
    title: "New Zealand",
    subtitle: "Adventure Paradise",
    image: "/countries/newzealand.webp",
    description: "New Zealand is famed for fjords, mountains and compact, dramatic scenery.",
    topHighlights: [
      "Milford Sound fjord cruises",
      "Queenstown adventure sports",
      "Hobbiton movie set tours",
      "Tongariro Alpine Crossing",
      "Rotorua geothermal wonders",
      "Maori cultural experiences"
    ],
    quickFacts: {
      bestTime: "Oct to Apr",
      currency: "NZD (New Zealand Dollar)",
      language: "English, Māori"
    },
    categories: {
      architecture: ["Historic Buildings", "Maori Meeting Houses", "Modern Design"],
      shopping: ["Wool Products", "Jade", "Local Crafts"],
      entertainment: ["Bungee Jumping", "Rafting", "Hiking"],
      culture: ["Maori Culture", "Museums", "Film Locations"]
    },
    perfectFor: [
      { icon: "adventure", title: "Thrill Seekers", description: "Multi-activity trips" },
      { icon: "family", title: "Nature Lovers", description: "Photography and road trips" },
      { icon: "shopping", title: "Film Fans", description: "Lord of the Rings tours" },
      { icon: "luxury", title: "Hikers", description: "Scenic trails" }
    ]
  },
  "canada": {
    title: "Canada",
    subtitle: "Wilderness & Cities",
    image: "/countries/canada.webp",
    description: "Canada offers vast wilderness, national parks and diverse cities.",
    topHighlights: [
      "Canadian Rockies and Banff",
      "Niagara Falls wonder",
      "Vancouver urban nature",
      "Quebec City European charm",
      "Northern lights viewing",
      "Wildlife in natural habitat"
    ],
    quickFacts: {
      bestTime: "Jun to Sep",
      currency: "CAD (Canadian Dollar)",
      language: "English, French"
    },
    categories: {
      architecture: ["Historic Quebec", "Modern Vancouver", "Parliament Hill"],
      shopping: ["Markets", "Malls", "Indigenous Crafts"],
      entertainment: ["Skiing", "Hiking", "Wildlife Tours"],
      culture: ["Museums", "Historic Sites", "Festivals"]
    },
    perfectFor: [
      { icon: "adventure", title: "Outdoor Enthusiasts", description: "Hiking and skiing" },
      { icon: "family", title: "Road Trippers", description: "Scenic drives" },
      { icon: "shopping", title: "Nature Photographers", description: "Mountains and wildlife" },
      { icon: "luxury", title: "City Lovers", description: "Vancouver and Toronto" }
    ]
  },
  "malaysia": {
    title: "Malaysia",
    subtitle: "Diversity & Nature",
    image: "/countries/malaysia.webp",
    description: "Malaysia combines cities, islands and rainforest biodiversity.",
    topHighlights: [
      "Kuala Lumpur Petronas Towers",
      "Penang street food capital",
      "Borneo rainforests and wildlife",
      "Langkawi island beaches",
      "Cameron Highlands tea plantations",
      "Multi-cultural heritage sites"
    ],
    quickFacts: {
      bestTime: "Mar to Oct",
      currency: "MYR (Malaysian Ringgit)",
      language: "Malay, English"
    },
    categories: {
      architecture: ["Petronas Towers", "Colonial Buildings", "Temples"],
      shopping: ["Night Markets", "Malls", "Local Crafts"],
      entertainment: ["Island Hopping", "Jungle Treks", "Cultural Shows"],
      culture: ["Multi-cultural Sites", "Museums", "Festivals"]
    },
    perfectFor: [
      { icon: "shopping", title: "Food Explorers", description: "Culinary variety" },
      { icon: "adventure", title: "Nature Lovers", description: "Rainforest and wildlife" },
      { icon: "family", title: "Beach Seekers", description: "Tropical islands" },
      { icon: "luxury", title: "City Visitors", description: "Modern Kuala Lumpur" }
    ]
  },
  "south-korea": {
    title: "South Korea",
    subtitle: "K-Culture & Tradition",
    image: "/countries/southkorea.jpg",
    description: "South Korea offers high-energy cities, coastal islands and mountain trails.",
    topHighlights: [
      "Seoul modern metropolis",
      "Jeju Island natural beauty",
      "Korean BBQ and street food",
      "Gyeongbokgung Palace",
      "Busan beaches and markets",
      "K-pop and entertainment culture"
    ],
    quickFacts: {
      bestTime: "Mar to May, Sep to Nov",
      currency: "KRW (Korean Won)",
      language: "Korean"
    },
    categories: {
      architecture: ["Palaces", "Modern Seoul", "Temples"],
      shopping: ["Myeongdong", "Markets", "K-beauty Stores"],
      entertainment: ["K-pop Shows", "Theme Parks", "Jjimjilbangs"],
      culture: ["Palaces", "Museums", "Traditional Villages"]
    },
    perfectFor: [
      { icon: "shopping", title: "Food Enthusiasts", description: "Korean BBQ and markets" },
      { icon: "family", title: "Culture Seekers", description: "Palaces and temples" },
      { icon: "adventure", title: "K-Culture Fans", description: "K-pop and entertainment" },
      { icon: "luxury", title: "City Explorers", description: "Modern Seoul" }
    ]
  },
  "morocco": {
    title: "Morocco",
    subtitle: "Medinas & Desert",
    image: "/countries/morocco.avif",
    description: "Morocco is known for medinas, desert landscapes and Atlas mountain scenery.",
    topHighlights: [
      "Marrakech souks and Jemaa el-Fnaa",
      "Sahara Desert camel treks",
      "Fes medieval medina",
      "Atlas Mountains hiking",
      "Chefchaouen blue city",
      "Traditional riads and hammams"
    ],
    quickFacts: {
      bestTime: "Mar to May, Sep to Nov",
      currency: "MAD (Moroccan Dirham)",
      language: "Arabic, French"
    },
    categories: {
      architecture: ["Medinas", "Mosques", "Kasbahs"],
      shopping: ["Souks", "Carpets", "Leather Goods"],
      entertainment: ["Desert Tours", "Cooking Classes", "Traditional Music"],
      culture: ["Medinas", "Museums", "Traditional Crafts"]
    },
    perfectFor: [
      { icon: "family", title: "Culture Seekers", description: "Medinas and markets" },
      { icon: "adventure", title: "Desert Explorers", description: "Desert treks" },
      { icon: "shopping", title: "Shoppers", description: "Souks and handicrafts" },
      { icon: "luxury", title: "Food Lovers", description: "Moroccan cuisine" }
    ]
  },
  "switzerland": {
    title: "Switzerland",
    subtitle: "Alpine Paradise",
    image: "/countries/switzerland.jpg",
    description: "Switzerland offers pristine Alps, charming villages, world-class skiing, and chocolate-making traditions in a breathtaking mountain setting.",
    topHighlights: [
      "Jungfraujoch - Top of Europe",
      "Matterhorn and Zermatt skiing",
      "Interlaken adventure sports hub",
      "Lucerne Chapel Bridge and old town",
      "Swiss chocolate and cheese tours",
      "Scenic train journeys through Alps"
    ],
    quickFacts: {
      bestTime: "Dec to Mar (skiing), Jun to Sep (hiking)",
      currency: "CHF (Swiss Franc)",
      language: "German, French, Italian"
    },
    categories: {
      architecture: [
        "Medieval Old Towns",
        "Chapel Bridge Lucerne",
        "Alpine Chalets"
      ],
      shopping: [
        "Swiss Watches",
        "Chocolate Shops",
        "Luxury Boutiques"
      ],
      entertainment: [
        "Skiing & Snowboarding",
        "Scenic Train Rides",
        "Hiking Trails"
      ],
      culture: [
        "Museums",
        "Mountain Villages",
        "Traditional Festivals"
      ]
    },
    perfectFor: [
      { icon: "adventure", title: "Ski Enthusiasts", description: "World-class slopes and winter sports" },
      { icon: "family", title: "Nature Lovers", description: "Pristine alpine landscapes and hiking" },
      { icon: "luxury", title: "Luxury Travelers", description: "High-end resorts and fine dining" },
      { icon: "shopping", title: "Train Enthusiasts", description: "Scenic railway journeys" }
    ]
  },
  "egypt": {
    title: "Egypt",
    subtitle: "Ancient Wonders",
    image: "/countries/egypt.avif",
    description: "Egypt is home to millennia-old monuments, Nile cruises and Red Sea diving.",
    topHighlights: [
      "Pyramids of Giza and Sphinx",
      "Luxor temples and Valley of the Kings",
      "Nile River cruises",
      "Cairo Egyptian Museum",
      "Red Sea diving and resorts",
      "Abu Simbel temples"
    ],
    quickFacts: {
      bestTime: "Oct to Apr",
      currency: "EGP (Egyptian Pound)",
      language: "Arabic"
    },
    categories: {
      architecture: ["Pyramids", "Temples", "Mosques"],
      shopping: ["Khan el-Khalili", "Bazaars", "Papyrus Shops"],
      entertainment: ["Nile Cruises", "Sound & Light Shows", "Diving"],
      culture: ["Museums", "Archaeological Sites", "Historic Landmarks"]
    },
    perfectFor: [
      { icon: "family", title: "History Lovers", description: "Archaeological exploration" },
      { icon: "adventure", title: "Adventure Seekers", description: "Desert and diving" },
      { icon: "shopping", title: "Culture Enthusiasts", description: "Ancient civilization" },
      { icon: "luxury", title: "Cruise Travelers", description: "Nile journeys" }
    ]
  },
  "tunisia": {
    title: "Tunisia",
    subtitle: "Mediterranean Charm",
    image: "/countries/tunisia.webp",
    description: "Tunisia mixes Mediterranean beaches, Roman ruins and Sahara oases.",
    topHighlights: [
      "Carthage ancient ruins",
      "El Djem Roman amphitheater",
      "Djerba island beaches",
      "Sidi Bou Said blue and white town",
      "Sahara desert experiences",
      "Medinas of Tunis and Sousse"
    ],
    quickFacts: {
      bestTime: "Mar to May, Sep to Oct",
      currency: "TND (Tunisian Dinar)",
      language: "Arabic, French"
    },
    categories: {
      architecture: ["Roman Ruins", "Medinas", "Mosques"],
      shopping: ["Markets", "Handicrafts", "Pottery"],
      entertainment: ["Beach Resorts", "Desert Tours", "Cultural Events"],
      culture: ["Archaeological Sites", "Museums", "Traditional Towns"]
    },
    perfectFor: [
      { icon: "adventure", title: "Beach Lovers", description: "Mediterranean coast" },
      { icon: "family", title: "History Buffs", description: "Roman and ancient sites" },
      { icon: "shopping", title: "Culture Seekers", description: "Medinas and traditions" },
      { icon: "luxury", title: "Desert Explorers", description: "Sahara adventures" }
    ]
  },
  "qatar": {
    title: "Qatar",
    subtitle: "Modern Marvel",
    image: "/countries/qatar.jpg",
    description: "Qatar mixes modern architecture, museums and desert experiences.",
    topHighlights: [
      "Museum of Islamic Art",
      "Souq Waqif traditional market",
      "Doha Corniche waterfront",
      "Desert safari adventures",
      "The Pearl-Qatar luxury island",
      "Katara Cultural Village"
    ],
    quickFacts: {
      bestTime: "Nov to Apr",
      currency: "QAR (Qatari Riyal)",
      language: "Arabic, English"
    },
    categories: {
      architecture: ["Modern Towers", "Museums", "Traditional Forts"],
      shopping: ["Souq Waqif", "Malls", "Luxury Boutiques"],
      entertainment: ["Desert Safaris", "Water Sports", "Cultural Shows"],
      culture: ["Museums", "Art Galleries", "Heritage Sites"]
    },
    perfectFor: [
      { icon: "luxury", title: "Luxury Travelers", description: "Modern hotels and dining" },
      { icon: "family", title: "Culture Enthusiasts", description: "Museums and galleries" },
      { icon: "shopping", title: "Shoppers", description: "Souqs and malls" },
      { icon: "adventure", title: "Desert Adventurers", description: "Safari experiences" }
    ]
  },
  "jordan": {
    title: "Jordan",
    subtitle: "Ancient Petra",
    image: "/countries/jordan.webp",
    description: "Jordan is famed for Petra, Wadi Rum and the Dead Sea's unique experiences.",
    topHighlights: [
      "Petra ancient city",
      "Wadi Rum desert landscapes",
      "Dead Sea floating experience",
      "Jerash Roman ruins",
      "Aqaba Red Sea diving",
      "Amman citadel and culture"
    ],
    quickFacts: {
      bestTime: "Mar to May, Sep to Nov",
      currency: "JOD (Jordanian Dinar)",
      language: "Arabic, English"
    },
    categories: {
      architecture: ["Petra", "Roman Ruins", "Castles"],
      shopping: ["Souqs", "Handicrafts", "Dead Sea Products"],
      entertainment: ["Desert Tours", "Diving", "Hot Air Balloons"],
      culture: ["Archaeological Sites", "Museums", "Bedouin Culture"]
    },
    perfectFor: [
      { icon: "family", title: "History Enthusiasts", description: "Archaeological sites" },
      { icon: "adventure", title: "Desert Explorers", description: "Desert tours" },
      { icon: "shopping", title: "Adventure Seekers", description: "Petra and hiking" },
      { icon: "luxury", title: "Wellness Travelers", description: "Dead Sea resorts" }
    ]
  },
  "czechia": {
    title: "Czechia",
    subtitle: "Medieval Charm",
    image: "/countries/czechia.jpeg",
    description: "Czechia (Prague) offers medieval architecture, castles and a rich cultural scene.",
    topHighlights: [
      "Prague Castle and Charles Bridge",
      "Old Town Square and Astronomical Clock",
      "Český Krumlov fairy tale town",
      "Czech beer culture and breweries",
      "Bohemian Forest nature",
      "Gothic and Baroque architecture"
    ],
    quickFacts: {
      bestTime: "Apr to Oct",
      currency: "CZK (Czech Koruna)",
      language: "Czech"
    },
    categories: {
      architecture: ["Castles", "Gothic Churches", "Historic Squares"],
      shopping: ["Bohemian Crystal", "Markets", "Antiques"],
      entertainment: ["Classical Music", "Beer Tours", "River Cruises"],
      culture: ["Museums", "Galleries", "Historic Sites"]
    },
    perfectFor: [
      { icon: "family", title: "History Lovers", description: "Castles and old towns" },
      { icon: "shopping", title: "Beer Enthusiasts", description: "Brewery tours" },
      { icon: "adventure", title: "Culture Seekers", description: "Music and museums" },
      { icon: "luxury", title: "Architecture Fans", description: "Medieval buildings" }
    ]
  },
  "poland": {
    title: "Poland",
    subtitle: "History & Nature",
    image: "/countries/poland.avif",
    description: "Poland features historic cities, mountain ranges and Baltic coastlines.",
    topHighlights: [
      "Kraków Old Town and Wawel Castle",
      "Warsaw rebuilt city center",
      "Auschwitz-Birkenau memorial",
      "Tatra Mountains hiking",
      "Wieliczka Salt Mine",
      "Baltic Sea beaches"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "PLN (Polish Zloty)",
      language: "Polish"
    },
    categories: {
      architecture: ["Castles", "Old Towns", "Churches"],
      shopping: ["Markets", "Amber Jewelry", "Crafts"],
      entertainment: ["Mountain Hiking", "City Tours", "Cultural Events"],
      culture: ["Museums", "Historic Sites", "Memorial Sites"]
    },
    perfectFor: [
      { icon: "family", title: "History Enthusiasts", description: "Medieval towns and heritage" },
      { icon: "adventure", title: "Outdoor Lovers", description: "Hiking and lakes" },
      { icon: "shopping", title: "Culture Seekers", description: "Museums and sites" },
      { icon: "luxury", title: "City Explorers", description: "Kraków and Warsaw" }
    ]
  },
  "hungary": {
    title: "Hungary",
    subtitle: "Thermal Baths",
    image: "/countries/hungary.jpg",
    description: "Hungary centers on Budapest's thermal baths, Danube views and historic architecture.",
    topHighlights: [
      "Budapest thermal baths",
      "Parliament Building on Danube",
      "Buda Castle and Fisherman's Bastion",
      "Ruin bars nightlife",
      "Lake Balaton resorts",
      "Hungarian wine regions"
    ],
    quickFacts: {
      bestTime: "Apr to Oct",
      currency: "HUF (Hungarian Forint)",
      language: "Hungarian"
    },
    categories: {
      architecture: ["Parliament", "Castles", "Basilicas"],
      shopping: ["Markets", "Porcelain", "Wine"],
      entertainment: ["Thermal Baths", "River Cruises", "Ruin Bars"],
      culture: ["Museums", "Opera Houses", "Historic Sites"]
    },
    perfectFor: [
      { icon: "luxury", title: "Wellness Seekers", description: "Spa and thermal experiences" },
      { icon: "family", title: "Culture Lovers", description: "Architecture and cuisine" },
      { icon: "shopping", title: "Nightlife Fans", description: "Ruin bars" },
      { icon: "adventure", title: "City Visitors", description: "Budapest charm" }
    ]
  },
  "croatia": {
    title: "Croatia",
    subtitle: "Adriatic Jewel",
    image: "/countries/coratia.jpg",
    description: "Croatia is famed for Adriatic coastlines, medieval towns and island hopping.",
    topHighlights: [
      "Dubrovnik Old Town walls",
      "Plitvice Lakes National Park",
      "Hvar island beaches and nightlife",
      "Split and Diocletian's Palace",
      "Istrian peninsula and truffle region",
      "Dalmatian Coast sailing"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "EUR (Euro)",
      language: "Croatian"
    },
    categories: {
      architecture: ["Medieval Towns", "Roman Ruins", "Churches"],
      shopping: ["Local Markets", "Olive Oil", "Wine"],
      entertainment: ["Sailing", "Beach Clubs", "Island Hopping"],
      culture: ["Historic Sites", "Museums", "Traditional Villages"]
    },
    perfectFor: [
      { icon: "adventure", title: "Island Hoppers", description: "Beaches and sailing" },
      { icon: "family", title: "History Lovers", description: "Medieval towns" },
      { icon: "shopping", title: "Beach Seekers", description: "Adriatic coast" },
      { icon: "luxury", title: "Nature Enthusiasts", description: "National parks" }
    ]
  },
  "belgium": {
    title: "Belgium",
    subtitle: "Chocolate & Beer",
    image: "/countries/belgium.jpg",
    description: "Belgium offers historic cities, chocolate, beer culture and UNESCO towns.",
    topHighlights: [
      "Brussels Grand Place and Manneken Pis",
      "Bruges medieval canals",
      "Belgian chocolate and waffles",
      "Beer culture and breweries",
      "Ghent historic center",
      "Antwerp diamond district"
    ],
    quickFacts: {
      bestTime: "Apr to Oct",
      currency: "EUR (Euro)",
      language: "Dutch, French, German"
    },
    categories: {
      architecture: ["Grand Place", "Belfries", "Art Nouveau"],
      shopping: ["Chocolate Shops", "Markets", "Diamonds"],
      entertainment: ["Beer Tours", "Canal Cruises", "Museums"],
      culture: ["Art Museums", "Historic Centers", "Festivals"]
    },
    perfectFor: [
      { icon: "shopping", title: "Foodies", description: "Chocolate and beer" },
      { icon: "family", title: "City Breakers", description: "Compact historic cities" },
      { icon: "adventure", title: "Culture Seekers", description: "Art and history" },
      { icon: "luxury", title: "Architecture Fans", description: "Medieval charm" }
    ]
  },
  "ireland": {
    title: "Ireland",
    subtitle: "Emerald Isle",
    image: "/countries/ireland.webp",
    description: "Ireland features green landscapes, dramatic coasts and lively cultural pubs.",
    topHighlights: [
      "Cliffs of Moher dramatic views",
      "Dublin pubs and Temple Bar",
      "Ring of Kerry scenic drive",
      "Galway cultural vibrancy",
      "Giant's Causeway formations",
      "Traditional Irish music sessions"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "EUR (Euro)",
      language: "English, Irish"
    },
    categories: {
      architecture: ["Castles", "Abbeys", "Georgian Dublin"],
      shopping: ["Woolen Goods", "Whiskey", "Crafts"],
      entertainment: ["Traditional Music", "Pub Culture", "Coastal Drives"],
      culture: ["Museums", "Literary Sites", "Historic Landmarks"]
    },
    perfectFor: [
      { icon: "adventure", title: "Scenery Lovers", description: "Coastal drives and cliffs" },
      { icon: "family", title: "Culture Enthusiasts", description: "Pub and music scene" },
      { icon: "shopping", title: "Road Trippers", description: "Scenic routes" },
      { icon: "luxury", title: "Literary Fans", description: "Dublin heritage" }
    ]
  },
  "denmark": {
    title: "Denmark",
    subtitle: "Hygge & Design",
    image: "/countries/denmark.jpg",
    description: "Denmark mixes hygge culture, coastal islands and modern Copenhagen design.",
    topHighlights: [
      "Copenhagen Nyhavn and Tivoli",
      "Little Mermaid statue",
      "Danish design and architecture",
      "Legoland family fun",
      "Hygge lifestyle experiences",
      "Coastal islands and beaches"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "DKK (Danish Krone)",
      language: "Danish"
    },
    categories: {
      architecture: ["Modern Design", "Palaces", "Colorful Houses"],
      shopping: ["Design Stores", "Markets", "Danish Products"],
      entertainment: ["Tivoli Gardens", "Museums", "Cycling Tours"],
      culture: ["Design Museums", "Historic Sites", "Art Galleries"]
    },
    perfectFor: [
      { icon: "family", title: "Design Lovers", description: "Architecture and culinary scene" },
      { icon: "shopping", title: "Families", description: "Legoland and Tivoli" },
      { icon: "adventure", title: "Cyclists", description: "Bike-friendly cities" },
      { icon: "luxury", title: "Foodies", description: "New Nordic cuisine" }
    ]
  },
  "sweden": {
    title: "Sweden",
    subtitle: "Scandinavian Beauty",
    image: "/countries/sweden.webp",
    description: "Sweden has expansive forests, archipelagos and modern Scandinavian cities.",
    topHighlights: [
      "Stockholm archipelago beauty",
      "Gamla Stan old town",
      "Icehotel unique experience",
      "Northern lights in Lapland",
      "Abba Museum and culture",
      "Swedish fika tradition"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "SEK (Swedish Krona)",
      language: "Swedish"
    },
    categories: {
      architecture: ["Royal Palace", "Modern Design", "Historic Towns"],
      shopping: ["Design Stores", "Markets", "Swedish Brands"],
      entertainment: ["Archipelago Tours", "Northern Lights", "Museums"],
      culture: ["Viking History", "Museums", "Music Heritage"]
    },
    perfectFor: [
      { icon: "adventure", title: "Nature Lovers", description: "Outdoor and archipelago trips" },
      { icon: "family", title: "City Explorers", description: "Stockholm charm" },
      { icon: "shopping", title: "Design Enthusiasts", description: "Scandinavian design" },
      { icon: "luxury", title: "Aurora Chasers", description: "Northern lights" }
    ]
  },
  "norway": {
    title: "Norway",
    subtitle: "Fjords & Northern Lights",
    image: "/countries/Norway.jpg",
    description: "Norway is known for fjords, northern lights and dramatic coastal scenery.",
    topHighlights: [
      "Fjord cruises and Geirangerfjord",
      "Northern lights viewing",
      "Bergen colorful Bryggen wharf",
      "Lofoten Islands scenery",
      "Oslo modern and historic blend",
      "Midnight sun experiences"
    ],
    quickFacts: {
      bestTime: "Jun to Aug (summer), Sep to Mar (aurora)",
      currency: "NOK (Norwegian Krone)",
      language: "Norwegian"
    },
    categories: {
      architecture: ["Stave Churches", "Modern Oslo", "Colorful Towns"],
      shopping: ["Wool Products", "Crafts", "Norwegian Design"],
      entertainment: ["Fjord Cruises", "Hiking", "Northern Lights"],
      culture: ["Viking Museums", "Art Galleries", "Historic Sites"]
    },
    perfectFor: [
      { icon: "adventure", title: "Scenery Enthusiasts", description: "Fjords and northern lights" },
      { icon: "family", title: "Nature Lovers", description: "Mountains and coast" },
      { icon: "shopping", title: "Photographers", description: "Dramatic landscapes" },
      { icon: "luxury", title: "Cruise Travelers", description: "Fjord journeys" }
    ]
  },
  "romania": {
    title: "Romania",
    subtitle: "Castles & Carpathians",
    image: "/countries/romania.jpg",
    description: "Romania offers castles, Transylvanian landscapes and Black Sea coasts.",
    topHighlights: [
      "Bran Castle (Dracula's Castle)",
      "Carpathian Mountains hiking",
      "Bucharest Palace of Parliament",
      "Transylvania medieval towns",
      "Painted monasteries of Bucovina",
      "Danube Delta wildlife"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "RON (Romanian Leu)",
      language: "Romanian"
    },
    categories: {
      architecture: ["Castles", "Monasteries", "Medieval Towns"],
      shopping: ["Crafts", "Markets", "Traditional Items"],
      entertainment: ["Hiking", "Wine Tours", "Rural Stays"],
      culture: ["Historic Sites", "Museums", "Folklore"]
    },
    perfectFor: [
      { icon: "family", title: "Castle Enthusiasts", description: "Medieval heritage" },
      { icon: "adventure", title: "Hikers", description: "Hiking and rural exploration" },
      { icon: "shopping", title: "Nature Lovers", description: "Mountains and forests" },
      { icon: "luxury", title: "Culture Seekers", description: "Historic towns" }
    ]
  },
  "bulgaria": {
    title: "Bulgaria",
    subtitle: "Black Sea & Mountains",
    image: "/countries/bulgaria.jpg",
    description: "Bulgaria features Black Sea beaches, ski resorts and historic towns.",
    topHighlights: [
      "Sunny Beach Black Sea resort",
      "Bansko ski slopes",
      "Sofia historic capital",
      "Plovdiv ancient city",
      "Rila Monastery UNESCO site",
      "Rose Valley and products"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "BGN (Bulgarian Lev)",
      language: "Bulgarian"
    },
    categories: {
      architecture: ["Monasteries", "Roman Ruins", "Orthodox Churches"],
      shopping: ["Rose Products", "Markets", "Crafts"],
      entertainment: ["Skiing", "Beach Resorts", "Hiking"],
      culture: ["Museums", "Historic Sites", "Traditional Villages"]
    },
    perfectFor: [
      { icon: "adventure", title: "Beach Lovers", description: "Affordable seaside resorts" },
      { icon: "family", title: "Winter Sports", description: "Ski resorts" },
      { icon: "shopping", title: "History Buffs", description: "Ancient sites" },
      { icon: "luxury", title: "Budget Travelers", description: "Affordable Europe" }
    ]
  },
  "dominican-republic": {
    title: "Dominican Republic",
    subtitle: "Caribbean Paradise",
    image: "/countries/dominican.jpg",
    description: "Caribbean beaches, all-inclusive resorts and vibrant culture define the Dominican Republic.",
    topHighlights: [
      "Punta Cana pristine beaches",
      "Santo Domingo colonial zone",
      "Samaná Peninsula whale watching",
      "All-inclusive beach resorts",
      "Merengue and bachata music",
      "Water sports and diving"
    ],
    quickFacts: {
      bestTime: "Dec to Apr",
      currency: "DOP (Dominican Peso)",
      language: "Spanish"
    },
    categories: {
      architecture: ["Colonial Buildings", "Churches", "Historic Zones"],
      shopping: ["Markets", "Rum", "Cigars"],
      entertainment: ["Water Sports", "Golf", "Beach Clubs"],
      culture: ["Music and Dance", "Museums", "Local Culture"]
    },
    perfectFor: [
      { icon: "adventure", title: "Beach Lovers", description: "Resorts and water sports" },
      { icon: "family", title: "Families", description: "All-inclusive resorts" },
      { icon: "shopping", title: "Water Sports", description: "Diving and surfing" },
      { icon: "luxury", title: "Relaxation Seekers", description: "Beach paradise" }
    ]
  },
  "cuba": {
    title: "Cuba",
    subtitle: "Vintage Charm",
    image: "/countries/cuba.jpg",
    description: "Cuba is known for vintage cars, vibrant music, historic Havana and Caribbean beaches.",
    topHighlights: [
      "Havana colonial architecture",
      "Vintage car tours",
      "Varadero white sand beaches",
      "Trinidad colonial town",
      "Cuban cigars and rum",
      "Salsa music and dance"
    ],
    quickFacts: {
      bestTime: "Nov to Apr",
      currency: "CUP/CUC",
      language: "Spanish"
    },
    categories: {
      architecture: ["Colonial Buildings", "Art Deco", "Colorful Streets"],
      shopping: ["Cigars", "Rum", "Local Art"],
      entertainment: ["Live Music", "Dance Shows", "Beach Clubs"],
      culture: ["Museums", "Music Heritage", "Revolutionary Sites"]
    },
    perfectFor: [
      { icon: "family", title: "Culture Seekers", description: "Music and colonial architecture" },
      { icon: "adventure", title: "Beach Lovers", description: "Caribbean coast" },
      { icon: "shopping", title: "Music Fans", description: "Salsa and culture" },
      { icon: "luxury", title: "History Enthusiasts", description: "Colonial heritage" }
    ]
  },
  "brazil": {
    title: "Brazil",
    subtitle: "Carnival & Amazon",
    image: "/countries/brazil.jpg",
    description: "Brazil offers Amazon rainforest, iconic Rio festivals, and long Atlantic beaches.",
    topHighlights: [
      "Rio de Janeiro and Carnival",
      "Amazon Rainforest adventures",
      "Iguazu Falls wonder",
      "Copacabana and Ipanema beaches",
      "Salvador Bahia Afro-Brazilian culture",
      "Samba and bossa nova music"
    ],
    quickFacts: {
      bestTime: "May to Sep (varies by region)",
      currency: "BRL (Brazilian Real)",
      language: "Portuguese"
    },
    categories: {
      architecture: ["Colonial Towns", "Modern Rio", "Churches"],
      shopping: ["Markets", "Gems", "Handicrafts"],
      entertainment: ["Carnival", "Samba Shows", "Beach Culture"],
      culture: ["Museums", "Music Heritage", "Indigenous Culture"]
    },
    perfectFor: [
      { icon: "adventure", title: "Adventure Seekers", description: "Rainforest and waterfalls" },
      { icon: "family", title: "Festival Lovers", description: "Carnival and music" },
      { icon: "shopping", title: "Beach Enthusiasts", description: "Atlantic coast" },
      { icon: "luxury", title: "Nature Explorers", description: "Amazon and wildlife" }
    ]
  },
  "argentina": {
    title: "Argentina",
    subtitle: "Tango & Patagonia",
    image: "/countries/argentina.webp",
    description: "Argentina mixes Buenos Aires culture, Patagonian landscapes and wine regions.",
    topHighlights: [
      "Buenos Aires tango culture",
      "Patagonia glaciers and mountains",
      "Mendoza wine region",
      "Iguazu Falls Argentine side",
      "Ushuaia end of the world",
      "Argentinian steak and asado"
    ],
    quickFacts: {
      bestTime: "Oct to Apr",
      currency: "ARS (Argentine Peso)",
      language: "Spanish"
    },
    categories: {
      architecture: ["European Style", "Colonial Buildings", "Modern Buenos Aires"],
      shopping: ["Leather Goods", "Wine", "Crafts"],
      entertainment: ["Tango Shows", "Wine Tours", "Glacier Cruises"],
      culture: ["Museums", "Tango Heritage", "Gaucho Culture"]
    },
    perfectFor: [
      { icon: "adventure", title: "Nature Lovers", description: "Glaciers and mountains" },
      { icon: "shopping", title: "Wine Enthusiasts", description: "Steak and wine" },
      { icon: "family", title: "Tango Fans", description: "Dance and culture" },
      { icon: "luxury", title: "Hikers", description: "Patagonian trails" }
    ]
  },
  "portugal": {
    title: "Portugal",
    subtitle: "Coast & Culture",
    image: "/countries/portugal.jpg",
    description: "Portugal features coastal towns, historic Lisbon and Douro wine country.",
    topHighlights: [
      "Lisbon's hills and trams",
      "Porto wine cellars and river",
      "Algarve golden beaches",
      "Douro Valley wine tours",
      "Sintra palaces and castles",
      "Azores volcanic islands"
    ],
    quickFacts: {
      bestTime: "Apr to Oct",
      currency: "EUR (Euro)",
      language: "Portuguese"
    },
    categories: {
      architecture: ["Azulejos Tiles", "Castles", "Monasteries"],
      shopping: ["Cork Products", "Wine", "Ceramics"],
      entertainment: ["Fado Music", "Wine Tours", "Beach Activities"],
      culture: ["Museums", "Historic Sites", "Maritime Heritage"]
    },
    perfectFor: [
      { icon: "adventure", title: "Beach Lovers", description: "Coastal escapes" },
      { icon: "shopping", title: "Wine Enthusiasts", description: "Douro and vineyards" },
      { icon: "family", title: "Culture Seekers", description: "Historic sites" },
      { icon: "luxury", title: "Surf Fans", description: "Atlantic waves" }
    ]
  },
  "austria": {
    title: "Austria",
    subtitle: "Music & Mountains",
    image: "/countries/austria.jpg",
    description: "Austria offers Alpine scenery, classical music heritage and charming cities.",
    topHighlights: [
      "Vienna imperial palaces and opera",
      "Salzburg Mozart's birthplace",
      "Hallstatt picturesque village",
      "Alpine skiing and hiking",
      "Schönbrunn Palace gardens",
      "Classical music concerts"
    ],
    quickFacts: {
      bestTime: "May to Sep",
      currency: "EUR (Euro)",
      language: "German"
    },
    categories: {
      architecture: ["Palaces", "Churches", "Alpine Villages"],
      shopping: ["Swarovski Crystal", "Markets", "Traditional Crafts"],
      entertainment: ["Classical Concerts", "Skiing", "Opera"],
      culture: ["Museums", "Music Heritage", "Imperial History"]
    },
    perfectFor: [
      { icon: "family", title: "Music Lovers", description: "Classical music and palaces" },
      { icon: "adventure", title: "Skiers", description: "Outdoor and skiing" },
      { icon: "shopping", title: "Culture Enthusiasts", description: "Imperial heritage" },
      { icon: "luxury", title: "Hikers", description: "Alpine trails" }
    ]
  },
  "mexico": {
    title: "Mexico",
    subtitle: "Culture & Beaches",
    image: "/countries/mexico.avif",
    description: "Mexico has rich heritage, beaches, and vibrant culinary and arts scenes.",
    topHighlights: [
      "Cancún Caribbean beaches",
      "Mexico City museums and culture",
      "Mayan ruins Chichen Itza",
      "Playa del Carmen diving",
      "Oaxaca culinary traditions",
      "Day of the Dead celebrations"
    ],
    quickFacts: {
      bestTime: "Nov to Apr",
      currency: "MXN (Mexican Peso)",
      language: "Spanish"
    },
    categories: {
      architecture: ["Mayan Ruins", "Colonial Cities", "Modern Mexico City"],
      shopping: ["Crafts", "Textiles", "Silver"],
      entertainment: ["Beach Resorts", "Cenote Swimming", "Cultural Shows"],
      culture: ["Archaeological Sites", "Museums", "Traditional Festivals"]
    },
    perfectFor: [
      { icon: "family", title: "Culture Lovers", description: "Archaeology and cities" },
      { icon: "adventure", title: "Beach Seekers", description: "Caribbean coast" },
      { icon: "shopping", title: "Foodies", description: "Authentic Mexican cuisine" },
      { icon: "luxury", title: "History Buffs", description: "Mayan heritage" }
    ]
  },
  "spain": {
    title: "Spain",
    subtitle: "Tapas & Fiestas",
    image: "/countries/spain.webp",
    description: "Spain offers diverse regions, tapas culture, historic cities and beaches.",
    topHighlights: [
      "Barcelona Gaudí architecture",
      "Madrid art museums Prado",
      "Andalusia flamenco and Moorish heritage",
      "Costa del Sol beaches",
      "Seville cathedral and culture",
      "San Sebastián culinary scene"
    ],
    quickFacts: {
      bestTime: "May to Oct",
      currency: "EUR (Euro)",
      language: "Spanish"
    },
    categories: {
      architecture: ["Sagrada Familia", "Alhambra", "Cathedrals"],
      shopping: ["Markets", "Fashion", "Local Crafts"],
      entertainment: ["Flamenco Shows", "Beach Clubs", "Festivals"],
      culture: ["Art Museums", "Historic Sites", "Bullfighting"]
    },
    perfectFor: [
      { icon: "shopping", title: "Food Lovers", description: "Tapas and wine" },
      { icon: "family", title: "Culture Enthusiasts", description: "Historic architecture" },
      { icon: "adventure", title: "Beach Goers", description: "Mediterranean coast" },
      { icon: "luxury", title: "Art Fans", description: "Museums and galleries" }
    ]
  }
};

type DestinationInfo = (typeof DESTINATION_INFO)[keyof typeof DESTINATION_INFO];

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
  
  // try loading a JSON file from `public/countries/{id}.json` first,
  // otherwise fall back to the in-file `DESTINATION_INFO` mapping.
  let destination: DestinationInfo | undefined = undefined;
  try {
    const jsonPath = path.join(process.cwd(), "public", "countries", `${id}.json`);
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, "utf8");
        destination = JSON.parse(raw) as DestinationInfo;
      }
  } catch (e) {
    // ignore and fallback
  }

  if (!destination) {
    destination = DESTINATION_INFO[id];
  }

  // Prefer an image shipped under public/countries if present
  // Try to read `public/countries/manifest.json` (preferred) to map id -> file.
  try {
    const manifestPath = path.join(process.cwd(), "public", "countries", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, "utf8");
      const manifest = JSON.parse(raw) as Record<string, string>;
      const file = manifest[id];
      if (file) destination.image = `/countries/${file}`;
    } else {
      // fallback: try a small set of variants (no hyphen, exact id)
      const exts = [".webp", ".jpg", ".jpeg", ".avif", ".png"];
      for (const variant of [id, id.replace(/-/g, ""), id.replace(/-/g, "_")]) {
        for (const ext of exts) {
          const imgPath = path.join(process.cwd(), "public", "countries", `${variant}${ext}`);
          if (fs.existsSync(imgPath)) {
            destination.image = `/countries/${variant}${ext}`;
            break;
          }
        }
        if (destination.image) break;
      }
    }
  } catch (e) {
    // ignore and use existing image
  }

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
                      {destination.topHighlights.map((highlight: string, idx: number) => (
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
                      {destination.categories.architecture.map((item: string, idx: number) => (
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
                      {destination.categories.shopping.map((item: string, idx: number) => (
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
                      {destination.categories.entertainment.map((item: string, idx: number) => (
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
                      {destination.categories.culture.map((item: string, idx: number) => (
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
                {destination.perfectFor.map((item: any, idx: number) => (
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
