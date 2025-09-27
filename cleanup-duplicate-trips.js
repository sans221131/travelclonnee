// cleanup-duplicate-trips.js
// Run this script to remove placeholder/test trip entries that were created by the cart drawer

const { db } = require('./db/client.ts');
const { tripRequests } = require('./db/schema.ts');
const { eq, or } = require('drizzle-orm');

async function cleanupDuplicateTrips() {
  try {
    console.log('🧹 Cleaning up placeholder/duplicate trip entries...');
    
    // Delete trips with placeholder data
    const deletedTrips = await db
      .delete(tripRequests)
      .where(
        or(
          eq(tripRequests.email, 'customer@example.com'),
          eq(tripRequests.passengerName, 'Customer')
        )
      )
      .returning();

    console.log(`✅ Removed ${deletedTrips.length} placeholder trip entries`);
    
    if (deletedTrips.length > 0) {
      console.log('Deleted trips:');
      deletedTrips.forEach((trip, i) => {
        console.log(`  ${i + 1}. ${trip.passengerName} (${trip.email}) - ${trip.destination}`);
      });
    }
    
    // Show remaining trips
    const remainingTrips = await db.select().from(tripRequests);
    console.log(`\n📊 Remaining trips in database: ${remainingTrips.length}`);
    
    if (remainingTrips.length > 0) {
      console.log('Current trips:');
      remainingTrips.forEach((trip, i) => {
        console.log(`  ${i + 1}. ${trip.passengerName} (${trip.email}) - ${trip.destination}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupDuplicateTrips()
  .then(() => {
    console.log('\n🎉 Cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });