// Simple test to verify database functions
const { getTripRequest, listTripRequests, findActivitiesByDestination } = require('./lib/db.ts');

async function testDatabase() {
  try {
    console.log('Testing database functions...');
    
    // Test listing trip requests
    console.log('Testing listTripRequests...');
    const trips = await listTripRequests(5);
    console.log(`Found ${trips.length} trip requests`);
    
    // Test finding activities
    console.log('Testing findActivitiesByDestination...');
    const activities = await findActivitiesByDestination('Paris', 5);
    console.log(`Found ${activities.length} activities for Paris`);
    
    console.log('Database tests completed successfully!');
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testDatabase();