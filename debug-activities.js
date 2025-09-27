// Debug specific trip activities
import { db } from './db/client.js';
import { activities, tripRequests, tripRequestActivities } from './db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

async function debugTripActivities() {
  try {
    console.log('Debugging trip activities...');

    // Get the most recent trips
    const recentTrips = await db
      .select()
      .from(tripRequests)
      .orderBy(desc(tripRequests.createdAt))
      .limit(5);

    console.log(`\nFound ${recentTrips.length} recent trips:`);
    
    for (const trip of recentTrips) {
      console.log(`\nTrip ID: ${trip.id}`);
      console.log(`From: ${trip.from} → To: ${trip.destination}`);
      console.log(`Status: ${trip.status}`);
      console.log(`Created: ${trip.createdAt}`);

      // Get activity associations for this trip
      const tripActivities = await db
        .select({
          activityId: tripRequestActivities.activityId,
          associationCreated: tripRequestActivities.createdAt,
          activityName: activities.name,
          activityPrice: activities.price,
          activityCurrency: activities.currency
        })
        .from(tripRequestActivities)
        .leftJoin(activities, eq(tripRequestActivities.activityId, activities.id))
        .where(eq(tripRequestActivities.tripRequestId, trip.id));

      console.log(`Associated activities: ${tripActivities.length}`);
      
      if (tripActivities.length > 0) {
        tripActivities.forEach(ta => {
          console.log(`  - ${ta.activityName || 'Unknown Activity'} (${ta.activityCurrency} ${ta.activityPrice})`);
          console.log(`    Activity ID: ${ta.activityId}`);
          console.log(`    Associated: ${ta.associationCreated}`);
        });
      } else {
        console.log(`  No activities associated with this trip`);
      }
    }

    // Also check if there are any orphaned activity associations
    console.log('\n--- Checking for orphaned associations ---');
    const allAssociations = await db
      .select()
      .from(tripRequestActivities)
      .orderBy(desc(tripRequestActivities.createdAt));

    console.log(`Total activity associations in database: ${allAssociations.length}`);
    
    if (allAssociations.length > 0) {
      console.log('Recent associations:');
      allAssociations.slice(0, 10).forEach(assoc => {
        console.log(`  Trip: ${assoc.tripRequestId} → Activity: ${assoc.activityId} (${assoc.createdAt})`);
      });
    }

    // Check available activities
    console.log('\n--- Available activities ---');
    const availableActivities = await db
      .select({
        id: activities.id,
        destinationId: activities.destinationId,
        name: activities.name,
        isActive: activities.isActive
      })
      .from(activities)
      .where(eq(activities.isActive, true))
      .limit(10);

    console.log(`Active activities available: ${availableActivities.length}`);
    availableActivities.forEach(activity => {
      console.log(`  - ${activity.name} (${activity.destinationId}) [${activity.id}]`);
    });

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugTripActivities().then(() => {
  console.log('\nDebug completed');
  process.exit(0);
});