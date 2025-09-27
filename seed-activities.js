// Seed activities in database
import { db } from './db/client.js';
import { activities } from './db/schema.js';

async function seedActivities() {
  try {
    console.log('Seeding activities...');

    const activitiesToInsert = [
      // Dubai Activities
      { destinationId: 'dubai', name: 'Burj Khalifa Observation Deck', description: 'Experience breathtaking views from the world\'s tallest building. Visit the observation deck on the 124th and 148th floors for panoramic views of Dubai\'s skyline, desert, and coastline.', price: '150.00', currency: 'USD', reviewCount: 15420, imageUrl: '/images/dubai.jpg', isActive: true },
      { destinationId: 'dubai', name: 'Desert Safari with BBQ Dinner', description: 'Adventure through the golden dunes with dune bashing, camel riding, sandboarding, and traditional entertainment followed by a delicious BBQ dinner under the stars.', price: '85.00', currency: 'USD', reviewCount: 8930, imageUrl: '/images/dubai.jpg', isActive: true },
      { destinationId: 'dubai', name: 'Dubai Marina Yacht Cruise', description: 'Sail through the stunning Dubai Marina on a luxury yacht. Enjoy spectacular views of the city\'s modern architecture and coastline with refreshments included.', price: '120.00', currency: 'USD', reviewCount: 3450, imageUrl: '/images/dubai.jpg', isActive: true },

      // Thailand Activities
      { destinationId: 'thailand', name: 'Phi Phi Islands Day Tour', description: 'Explore the famous Phi Phi Islands with crystal clear waters, pristine beaches, and stunning limestone cliffs. Includes snorkeling, lunch, and Maya Bay visit.', price: '65.00', currency: 'USD', reviewCount: 12340, imageUrl: '/images/thailand.jpg', isActive: true },
      { destinationId: 'thailand', name: 'Bangkok Temple & Grand Palace Tour', description: 'Discover Bangkok\'s most sacred temples including Wat Pho, Wat Phra Kaew, and the magnificent Grand Palace with expert local guides.', price: '45.00', currency: 'USD', reviewCount: 9870, imageUrl: '/images/thailand.jpg', isActive: true },

      // London Activities
      { destinationId: 'london', name: 'Tower of London & Crown Jewels', description: 'Explore 1000 years of history at the Tower of London. See the Crown Jewels, meet the Beefeaters, and learn about the tower\'s fascinating past.', price: '35.00', currency: 'GBP', reviewCount: 18500, imageUrl: '/images/london.jpg', isActive: true },
      { destinationId: 'london', name: 'Westminster Abbey & Big Ben Tour', description: 'Visit the coronation church of British monarchs and see the iconic Big Ben. Includes audio guide and access to Poets\' Corner.', price: '28.00', currency: 'GBP', reviewCount: 14200, imageUrl: '/images/london.jpg', isActive: true },

      // Add a few more for testing
      { destinationId: 'bali', name: 'Ubud Rice Terraces & Monkey Forest', description: 'Explore the famous Tegallalang Rice Terraces and visit the Sacred Monkey Forest Sanctuary. Experience traditional Balinese culture and cuisine.', price: '40.00', currency: 'USD', reviewCount: 11250, imageUrl: '/images/bali.jpg', isActive: true },
      { destinationId: 'paris', name: 'Eiffel Tower Skip-the-Line & Seine Cruise', description: 'Skip the lines at the Eiffel Tower and enjoy panoramic views from the second floor, followed by a relaxing Seine River cruise with commentary.', price: '45.00', currency: 'EUR', reviewCount: 19800, imageUrl: '/images/paris.jpg', isActive: true },
    ];

    // Clear existing activities
    await db.delete(activities);
    console.log('Cleared existing activities');

    // Insert new activities
    const inserted = await db.insert(activities).values(activitiesToInsert).returning();
    console.log(`Successfully inserted ${inserted.length} activities`);

    // Show inserted activities
    inserted.forEach(activity => {
      console.log(`- ${activity.name} (${activity.destinationId}) - ${activity.currency} ${activity.price}`);
    });

  } catch (error) {
    console.error('Error seeding activities:', error);
  }
}

seedActivities().then(() => {
  console.log('Seeding completed');
  process.exit(0);
});