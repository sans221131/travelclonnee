// fix-missing-activities.js
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "postgresql://neondb_owner:npg_WImJo8X5pqvR@ep-hidden-dust-a1ftrrr8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = postgres(connectionString);

async function fixMissingActivities() {
  try {
    console.log('Finding recent trips without activities...\n');
    
    // Get the most recent trip (Somaan's trip to Dubai)
    const recentTrips = await client`
      SELECT * FROM trip_requests 
      WHERE passenger_name = 'Somaan' AND destination = 'Dubai, UAE'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    if (recentTrips.length === 0) {
      console.log('No recent trip found');
      return;
    }
    
    const trip = recentTrips[0];
    console.log(`Found trip: ${trip.passenger_name} to ${trip.destination}`);
    console.log(`Trip ID: ${trip.id}`);
    
    // Get Dubai activities (since that's the destination)
    const dubaiActivities = await client`
      SELECT * FROM activities 
      WHERE destination_id = 'dubai' AND is_active = true
      LIMIT 2
    `;
    
    console.log(`\nFound ${dubaiActivities.length} Dubai activities to associate:`);
    
    for (const activity of dubaiActivities) {
      console.log(`Associating: ${activity.name} (${activity.currency} ${activity.price})`);
      
      // Check if already associated
      const existing = await client`
        SELECT * FROM trip_request_activities 
        WHERE trip_request_id = ${trip.id} AND activity_id = ${activity.id}
      `;
      
      if (existing.length === 0) {
        await client`
          INSERT INTO trip_request_activities (trip_request_id, activity_id)
          VALUES (${trip.id}, ${activity.id})
        `;
        console.log('✓ Associated successfully');
      } else {
        console.log('✓ Already associated');
      }
    }
    
    console.log('\n🎉 Activities have been associated with your trip!');
    console.log('Refresh the admin dashboard to see the updated activities.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixMissingActivities();