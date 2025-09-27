// Check activities in database
import { db } from './db/client.js';
import { activities, tripRequests, tripRequestActivities } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function checkActivities() {
  try {
    console.log('Checking activities in database...');
    
    // Get all activities
    const allActivities = await db.select().from(activities);
    console.log(`Total activities in database: ${allActivities.length}`);
    
    if (allActivities.length > 0) {
      console.log('Activities:');
      allActivities.forEach(activity => {
        console.log(`- ${activity.id}: ${activity.name} (${activity.destinationId})`);
      });
    }
    
    // Check recent trips
    const recentTrips = await db.select().from(tripRequests).orderBy(tripRequests.createdAt).limit(3);
    console.log(`\nRecent trips: ${recentTrips.length}`);
    
    for (const trip of recentTrips) {
      console.log(`Trip ${trip.id}: ${trip.from} → ${trip.destination}`);
      
      // Check activities for this trip
      const tripActivitiesData = await db
        .select()
        .from(tripRequestActivities)
        .where(eq(tripRequestActivities.tripRequestId, trip.id));
      
      console.log(`  Associated activities: ${tripActivitiesData.length}`);
      tripActivitiesData.forEach(ta => {
        console.log(`    - Activity ID: ${ta.activityId}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkActivities().then(() => process.exit(0));