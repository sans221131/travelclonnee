// debug-trip-activities.js
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Use the same database connection as your app
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.log('No database connection string found. Check your .env file.');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function debugTripActivities() {
  try {
    console.log('Checking trip requests and their activities...\n');
    
    // Get all trip requests
    const trips = await client`SELECT * FROM trip_requests ORDER BY created_at DESC LIMIT 5`;
    console.log(`Found ${trips.length} recent trips:`);
    
    for (const trip of trips) {
      console.log(`\nTrip ID: ${trip.id.slice(0, 8)}...`);
      console.log(`Customer: ${trip.passenger_name} (${trip.email})`);
      console.log(`Destination: ${trip.destination}`);
      console.log(`Created: ${trip.created_at}`);
      
      // Check associated activities
      const activities = await client`
        SELECT tra.*, a.name, a.price, a.currency 
        FROM trip_request_activities tra
        JOIN activities a ON tra.activity_id = a.id
        WHERE tra.trip_request_id = ${trip.id}
      `;
      
      if (activities.length > 0) {
        console.log(`Activities (${activities.length}):`);
        activities.forEach(act => {
          console.log(`  - ${act.name} (${act.currency} ${act.price})`);
        });
      } else {
        console.log('No activities found for this trip');
      }
    }
    
    await client.end();
  } catch (error) {
    console.error('Error:', error);
    await client.end();
  }
}

debugTripActivities();