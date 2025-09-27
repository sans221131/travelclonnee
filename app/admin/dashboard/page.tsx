// app/admin/dashboard/page.tsx
import { Suspense } from "react";
import { db } from "@/db/client";
import { tripRequests, activities, tripRequestActivities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import DashboardHeader from "@/components/admin/DashboardHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getTripRequestsWithActivities() {
  try {
    console.log("Fetching trips with activities...");
    
    // Get all trip requests first
    const allTrips = await db
      .select()
      .from(tripRequests)
      .orderBy(desc(tripRequests.createdAt));
    
    console.log(`Found ${allTrips.length} trips`);

    // Use a more efficient approach with a single query to get all trip-activity associations
    const tripActivityAssociations = await db
      .select({
        tripRequestId: tripRequestActivities.tripRequestId,
        activity: {
          id: activities.id,
          destinationId: activities.destinationId,
          name: activities.name,
          description: activities.description,
          price: activities.price,
          currency: activities.currency,
          reviewCount: activities.reviewCount,
          imageUrl: activities.imageUrl,
          isActive: activities.isActive,
          createdAt: activities.createdAt,
          updatedAt: activities.updatedAt
        }
      })
      .from(tripRequestActivities)
      .innerJoin(activities, eq(tripRequestActivities.activityId, activities.id))
      .where(eq(activities.isActive, true));

    console.log(`Found ${tripActivityAssociations.length} activity associations`);

    // Group activities by trip ID
    const activitiesByTripId = new Map<string, typeof activities.$inferSelect[]>();
    
    tripActivityAssociations.forEach(assoc => {
      const tripId = assoc.tripRequestId;
      if (!activitiesByTripId.has(tripId)) {
        activitiesByTripId.set(tripId, []);
      }
      activitiesByTripId.get(tripId)!.push(assoc.activity);
    });

    // Combine trips with their activities
    const tripsWithActivities = allTrips.map(trip => ({
      ...trip,
      activities: activitiesByTripId.get(trip.id) || []
    }));

    console.log(`Trips with activities: ${tripsWithActivities.filter(t => t.activities.length > 0).length}`);

    return tripsWithActivities;
  } catch (error) {
    console.error("Error fetching trip requests:", error);
    return [];
  }
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400 text-lg">Loading dashboard data...</p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const tripData = await getTripRequestsWithActivities();

  return (
    <div className="min-h-screen bg-zinc-950">
      <DashboardHeader />

      <Suspense fallback={<DashboardLoading />}>
        <AdminDashboard trips={tripData} />
      </Suspense>
    </div>
  );
}