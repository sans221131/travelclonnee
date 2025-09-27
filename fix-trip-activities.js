// Manually add activities to the most recent trip for testing
import { db } from './db/client.js';
import { activities, tripRequests, tripRequestActivities } from './db/schema.js';
import { eq, desc } from 'drizzle-orm';

async function addActivitiesToRecentTrip() {
  try {
    console.log('Adding activities to most recent trip...');

    // Get the most recent trip
    const [recentTrip] = await db
      .select()
      .from(tripRequests)
      .orderBy(desc(tripRequests.createdAt))
      .limit(1);

    if (!recentTrip) {
      console.log('No trips found in database');
      return;
    }

    console.log(`Found recent trip: ${recentTrip.id}`);
    console.log(`Trip: ${recentTrip.origin} → ${recentTrip.destination}`);
    console.log(`Passenger: ${recentTrip.passengerName}`);

    // Get destination-appropriate activities
    const destination = recentTrip.destination.toLowerCase();
    let destinationId = 'dubai'; // default

    if (destination.includes('dubai')) destinationId = 'dubai';
    else if (destination.includes('thailand') || destination.includes('bangkok')) destinationId = 'thailand';
    else if (destination.includes('london')) destinationId = 'london';
    else if (destination.includes('bali')) destinationId = 'bali';
    else if (destination.includes('paris')) destinationId = 'paris';

    console.log(`Looking for activities with destinationId: ${destinationId}`);

    // Get available activities for this destination
    const availableActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.destinationId, destinationId))
      .limit(3);

    if (availableActivities.length === 0) {
      console.log(`No activities found for destination: ${destinationId}`);
      console.log('Available destinations in database:');
      const allActivities = await db.select({ destinationId: activities.destinationId }).from(activities);
      const uniqueDestinations = [...new Set(allActivities.map(a => a.destinationId))];
      console.log(uniqueDestinations);
      return;
    }

    console.log(`Found ${availableActivities.length} activities for ${destinationId}:`);
    availableActivities.forEach(activity => {
      console.log(`- ${activity.name} (${activity.currency} ${activity.price})`);
    });

    // Remove existing associations for this trip
    await db
      .delete(tripRequestActivities)
      .where(eq(tripRequestActivities.tripRequestId, recentTrip.id));
    
    console.log('Cleared existing activity associations');

    // Add new associations
    const associations = availableActivities.slice(0, 2).map(activity => ({
      tripRequestId: recentTrip.id,
      activityId: activity.id
    }));

    const inserted = await db
      .insert(tripRequestActivities)
      .values(associations)
      .returning();

    console.log(`Successfully added ${inserted.length} activities to the trip:`);
    inserted.forEach((assoc, index) => {
      const activity = availableActivities[index];
      console.log(`✓ Associated: ${activity.name}`);
    });

    // Verify the associations
    const verification = await db
      .select({
        activityName: activities.name,
        activityPrice: activities.price,
        activityCurrency: activities.currency
      })
      .from(tripRequestActivities)
      .innerJoin(activities, eq(tripRequestActivities.activityId, activities.id))
      .where(eq(tripRequestActivities.tripRequestId, recentTrip.id));

    console.log('\nVerification - Activities now associated with trip:');
    verification.forEach(v => {
      console.log(`✓ ${v.activityName} (${v.activityCurrency} ${v.activityPrice})`);
    });

  } catch (error) {
    console.error('Error adding activities to trip:', error);
  }
}

addActivitiesToRecentTrip().then(() => {
  console.log('\nScript completed');
  process.exit(0);
});