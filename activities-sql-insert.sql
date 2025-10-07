-- SQL INSERT statements for activities table
-- Copy and paste this into your Neon database console

-- This INSERT is idempotent: if an activity with the same (destination_id, name)
-- already exists (there's a unique index in the schema), the row will be skipped.
-- That makes it safe to run this file multiple times.

-- Create invoices table (if it doesn't exist) to match `db/schema.ts`'s `invoices` definition.
-- Run this file as-is to create the table and then seed activities.
CREATE TABLE IF NOT EXISTS invoices (
	id text PRIMARY KEY,
	receipt text NOT NULL UNIQUE,
	customer_name text,
	customer_email text,
	customer_phone text,
	amount_in_paise integer NOT NULL,
	currency text NOT NULL DEFAULT 'INR',
	provider text NOT NULL DEFAULT 'mock',
	provider_invoice_id text,
	provider_short_url text,
	status text NOT NULL DEFAULT 'draft',
	notes jsonb,
	created_at timestamp without time zone DEFAULT now(),
	updated_at timestamp without time zone DEFAULT now()
);

-- Optional: if you prefer a native uuid id and timestamptz, use the variant below instead
-- (uncomment and run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` first):
-- CREATE TABLE IF NOT EXISTS invoices (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   receipt text NOT NULL UNIQUE,
--   customer_name text,
--   customer_email text,
--   customer_phone text,
--   amount_in_paise integer NOT NULL,
--   currency text NOT NULL DEFAULT 'INR',
--   provider text NOT NULL DEFAULT 'mock',
--   provider_invoice_id text,
--   provider_short_url text,
--   status text NOT NULL DEFAULT 'draft',
--   notes jsonb,
--   created_at timestamp with time zone DEFAULT now(),
--   updated_at timestamp with time zone DEFAULT now()
-- );

INSERT INTO activities (destination_id, name, description, price, currency, review_count, image_url) VALUES

-- Dubai Activities
('dubai', 'Burj Khalifa Observation Deck', 'Experience breathtaking views from the world''s tallest building. Visit the observation deck on the 124th and 148th floors for panoramic views of Dubai''s skyline, desert, and coastline.', 150.00, 'USD', 15420, '/images/dubai.jpg'),
('dubai', 'Desert Safari with BBQ Dinner', 'Adventure through the golden dunes with dune bashing, camel riding, sandboarding, and traditional entertainment followed by a delicious BBQ dinner under the stars.', 85.00, 'USD', 8930, '/images/dubai.jpg'),
('dubai', 'Dubai Marina Yacht Cruise', 'Sail through the stunning Dubai Marina on a luxury yacht. Enjoy spectacular views of the city''s modern architecture and coastline with refreshments included.', 120.00, 'USD', 3450, '/images/dubai.jpg'),

-- Thailand Activities
('thailand', 'Phi Phi Islands Day Tour', 'Explore the famous Phi Phi Islands with crystal clear waters, pristine beaches, and stunning limestone cliffs. Includes snorkeling, lunch, and Maya Bay visit.', 65.00, 'USD', 12340, '/images/thailand.jpg'),
('thailand', 'Bangkok Temple & Grand Palace Tour', 'Discover Bangkok''s most sacred temples including Wat Pho, Wat Phra Kaew, and the magnificent Grand Palace with expert local guides.', 45.00, 'USD', 9870, '/images/thailand.jpg'),
('thailand', 'Floating Market & Elephant Sanctuary', 'Visit traditional floating markets and interact ethically with rescued elephants in their natural habitat. Includes transportation and traditional lunch.', 95.00, 'USD', 5620, '/images/thailand.jpg'),

-- London Activities
('london', 'Tower of London & Crown Jewels', 'Explore 1000 years of history at the Tower of London. See the Crown Jewels, meet the Beefeaters, and learn about the tower''s fascinating past.', 35.00, 'GBP', 18500, '/images/london.jpg'),
('london', 'Westminster Abbey & Big Ben Tour', 'Visit the coronation church of British monarchs and see the iconic Big Ben. Includes audio guide and access to Poets'' Corner.', 28.00, 'GBP', 14200, '/images/london.jpg'),
('london', 'Thames River Evening Cruise', 'Enjoy London''s illuminated skyline from the Thames with commentary, dinner, and views of Tower Bridge, London Eye, and Parliament.', 55.00, 'GBP', 7890, '/images/london.jpg'),

-- United States Activities
('united-states', 'Statue of Liberty & Ellis Island', 'Take the ferry to Liberty Island and Ellis Island. Explore the Statue of Liberty Museum and learn about America''s immigration history.', 24.00, 'USD', 22100, '/images/united-states.jpg'),
('united-states', 'Grand Canyon Helicopter Tour', 'Experience the breathtaking Grand Canyon from above on this unforgettable helicopter tour with expert pilots and stunning aerial views.', 199.00, 'USD', 8950, '/images/united-states.jpg'),
('united-states', 'Broadway Show & Times Square Tour', 'Enjoy a premium Broadway show and guided tour of iconic Times Square. Includes theater district history and restaurant recommendations.', 145.00, 'USD', 6730, '/images/united-states.jpg'),

-- Bali Activities
('bali', 'Ubud Rice Terraces & Monkey Forest', 'Explore the famous Tegallalang Rice Terraces and visit the Sacred Monkey Forest Sanctuary. Experience traditional Balinese culture and cuisine.', 40.00, 'USD', 11250, '/images/bali.jpg'),
('bali', 'Mount Batur Sunrise Trekking', 'Hike to the summit of Mount Batur volcano for a spectacular sunrise view. Includes breakfast cooked by volcanic steam and natural hot springs.', 35.00, 'USD', 9340, '/images/bali.jpg'),
('bali', 'Nusa Penida Island Day Trip', 'Visit the stunning Nusa Penida island with its dramatic cliffs, pristine beaches, and crystal clear waters. Includes snorkeling and lunch.', 75.00, 'USD', 7820, '/images/bali.jpg'),

-- Switzerland Activities
('switzerland', 'Jungfraujoch - Top of Europe', 'Take the scenic train journey to Jungfraujoch, the highest railway station in Europe. Experience glaciers, snow activities, and panoramic Alpine views.', 85.00, 'CHF', 13450, '/images/switzerland.jpg'),
('switzerland', 'Lake Geneva Scenic Cruise', 'Cruise the beautiful Lake Geneva with views of the Alps, vineyards, and charming lakeside villages. Includes wine tasting and Swiss cuisine.', 65.00, 'CHF', 5890, '/images/switzerland.jpg'),
('switzerland', 'Matterhorn Glacier Paradise', 'Visit the iconic Matterhorn peak via cable car to Glacier Paradise. Enjoy year-round snow, ice sculptures, and breathtaking mountain views.', 95.00, 'CHF', 8920, '/images/switzerland.jpg'),

-- Paris Activities
('paris', 'Eiffel Tower Skip-the-Line & Seine Cruise', 'Skip the lines at the Eiffel Tower and enjoy panoramic views from the second floor, followed by a relaxing Seine River cruise with commentary.', 45.00, 'EUR', 19800, '/images/paris.jpg'),
('paris', 'Louvre Museum & Mona Lisa Tour', 'Explore the world''s largest art museum with skip-the-line access. See the Mona Lisa, Venus de Milo, and other masterpieces with expert guides.', 55.00, 'EUR', 16700, '/images/paris.jpg'),
('paris', 'Versailles Palace & Gardens', 'Visit the opulent Palace of Versailles and its magnificent gardens. Includes audio guide and access to the Hall of Mirrors.', 35.00, 'EUR', 12400, '/images/paris.jpg'),

-- Bhutan Activities
('bhutan', 'Tiger''s Nest Monastery Hike', 'Hike to the famous Tiger''s Nest Monastery perched on a cliff 3,000 feet above Paro valley. Includes cultural insights and traditional lunch.', 120.00, 'USD', 2340, '/images/bhutan.png'),
('bhutan', 'Thimphu Cultural Heritage Tour', 'Explore Bhutan''s capital with visits to traditional monasteries, markets, and learn about Gross National Happiness philosophy.', 85.00, 'USD', 1890, '/images/bhutan.png'),
('bhutan', 'Punakha Dzong & River Rafting', 'Visit the beautiful Punakha Dzong fortress and enjoy gentle river rafting on the Mo Chhu river with stunning Himalayan views.', 95.00, 'USD', 1560, '/images/bhutan.png'),

-- Maldives Activities
('maldives', 'Dolphin Watching & Snorkeling Safari', 'Spot playful dolphins and explore vibrant coral reefs. Includes snorkeling equipment, refreshments, and underwater photography.', 85.00, 'USD', 4560, '/images/maldives.jpg'),
('maldives', 'Sunset Fishing & BBQ Dinner', 'Experience traditional Maldivian fishing at sunset followed by a beach BBQ with your fresh catch. Includes equipment and local guides.', 75.00, 'USD', 3890, '/images/maldives.jpg'),
('maldives', 'Seaplane Island Hopping Tour', 'Explore multiple atolls and islands from above and below with seaplane transfers, snorkeling stops, and luxury resort visits.', 299.00, 'USD', 2180, '/images/maldives.jpg'),

-- Kerala Activities
('kerala', 'Backwater Houseboat Cruise', 'Cruise through Kerala''s famous backwaters on a traditional houseboat. Includes meals prepared onboard and visits to local villages.', 120.00, 'USD', 8920, '/images/kerala.jpg'),
('kerala', 'Munnar Tea Plantation Tour', 'Explore lush tea gardens in the hill station of Munnar. Learn about tea processing and enjoy fresh tea tasting with mountain views.', 45.00, 'USD', 6740, '/images/kerala.jpg'),
('kerala', 'Periyar Wildlife Safari', 'Spot elephants, tigers, and exotic birds in Periyar National Park. Includes boat safari on Periyar Lake and nature walks.', 65.00, 'USD', 4320, '/images/kerala.jpg'),

-- Assam Activities
('assam', 'Kaziranga National Park Safari', 'Explore the famous one-horned rhinoceros habitat in Kaziranga National Park. Includes jeep safari and bird watching with expert guides.', 75.00, 'USD', 3450, '/images/assam.jpg'),
('assam', 'Tea Garden Experience & Majuli Island', 'Visit authentic tea gardens and explore Majuli, the world''s largest river island with traditional Assamese culture and monasteries.', 95.00, 'USD', 2890, '/images/assam.jpg'),
('assam', 'Brahmaputra River Cruise', 'Cruise the mighty Brahmaputra River with dolphin spotting, sunset views, and traditional Assamese cuisine onboard.', 85.00, 'USD', 2340, '/images/assam.jpg'),

-- Himachal Pradesh Activities
('himachal', 'Manali Adventure Sports Package', 'Experience thrilling adventure sports in Manali including paragliding, river rafting, and trekking with certified instructors and safety equipment.', 80.00, 'USD', 3450, '/images/himachal.jpg'),
('himachal', 'Shimla Colonial Heritage Walk', 'Explore the colonial architecture and heritage of Shimla including Mall Road, Christ Church, and Viceregal Lodge with historical insights.', 35.00, 'USD', 4560, '/images/himachal.jpg'),
('himachal', 'Dharamshala & Dalai Lama Temple', 'Visit the residence of the Dalai Lama in Dharamshala and explore Tibetan culture, monasteries, and mountain views.', 55.00, 'USD', 3890, '/images/himachal.jpg'),

-- Meghalaya Activities
('meghalaya', 'Living Root Bridges Trek', 'Trek to the famous double-decker living root bridges in Cherrapunji. Experience unique bio-engineering and pristine nature.', 65.00, 'USD', 2890, '/images/meghalaya.jpg'),
('meghalaya', 'Mawlynnong Cleanest Village Tour', 'Visit Asia''s cleanest village Mawlynnong and explore the surrounding waterfalls, viewpoints, and Khasi tribal culture.', 45.00, 'USD', 2340, '/images/meghalaya.jpg'),
('meghalaya', 'Shillong Cultural & Music Tour', 'Explore the Scotland of the East with its music culture, colonial architecture, and beautiful lakes with local musician interactions.', 50.00, 'USD', 1890, '/images/meghalaya.jpg'),

-- Mysore Activities
('mysore', 'Mysore Palace & Chamundi Hills', 'Visit the magnificent Mysore Palace and climb Chamundi Hills for panoramic city views. Includes palace illumination tour if evening.', 40.00, 'USD', 5670, '/images/mysore.jpg'),
('mysore', 'Srirangapatna Historical Tour', 'Explore the historical island town of Srirangapatna with Tipu Sultan''s summer palace, fort, and the Ranganathaswamy temple.', 35.00, 'USD', 3450, '/images/mysore.jpg'),
('mysore', 'Mysore Silk Weaving & Sandalwood Workshop', 'Experience traditional Mysore silk weaving and sandalwood oil making with artisan interactions and shopping opportunities.', 55.00, 'USD', 2890, '/images/mysore.jpg'),

-- Rajasthan Activities
('rajasthan', 'Jaipur City Palace & Hawa Mahal', 'Explore the Pink City''s magnificent palaces including the City Palace complex and the iconic Hawa Mahal (Palace of Winds).', 45.00, 'USD', 8920, '/images/rajasthan.jpg'),
('rajasthan', 'Udaipur Lake Palace & Boat Cruise', 'Visit the romantic City of Lakes with Lake Palace, City Palace, and sunset boat cruise on Lake Pichola.', 65.00, 'USD', 6740, '/images/rajasthan.jpg'),
('rajasthan', 'Jaisalmer Desert Safari & Fort', 'Experience the golden city of Jaisalmer with fort exploration, camel safari in Thar Desert, and overnight desert camping.', 95.00, 'USD', 5890, '/images/rajasthan.jpg'),

-- Uttarakhand Activities
('uttarakhand', 'Rishikesh Yoga & River Rafting', 'Combine spiritual experiences with adventure in Rishikesh. Includes yoga sessions, Ganga Aarti, and thrilling river rafting.', 75.00, 'USD', 4560, '/images/uttarakhand.jpg'),
('uttarakhand', 'Nainital Lake District Tour', 'Explore the beautiful hill station of Nainital with lake boating, mall road walks, and scenic viewpoints in the Himalayas.', 55.00, 'USD', 3890, '/images/uttarakhand.jpg'),
('uttarakhand', 'Haridwar Spiritual Experience', 'Experience the holy city of Haridwar with temple visits, Har Ki Pauri Ganga Aarti, and spiritual ceremonies.', 40.00, 'USD', 5230, '/images/uttarakhand.jpg'),

-- Ladakh Activities
('ladakh', 'Leh Magnetic Hill & Monasteries', 'Visit the mysterious Magnetic Hill and ancient Buddhist monasteries including Hemis and Thiksey with stunning Ladakh landscapes.', 110.00, 'USD', 2890, '/images/ladakh.jpg'),
('ladakh', 'Pangong Lake High Altitude Adventure', 'Journey to the spectacular Pangong Lake at 14,000 feet altitude with changing colors and breathtaking mountain reflections.', 145.00, 'USD', 2340, '/images/ladakh.jpg'),
('ladakh', 'Nubra Valley Desert & Double Hump Camels', 'Explore the cold desert of Nubra Valley with unique double-hump Bactrian camel rides and sand dunes at high altitude.', 120.00, 'USD', 1890, '/images/ladakh.jpg');
-- Skip inserting rows that would conflict with the unique index on (destination_id, name)
ON CONFLICT ON CONSTRAINT activities_destination_name_unique DO NOTHING;