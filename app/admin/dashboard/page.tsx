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
    // Get all trip requests
    const trips = await db.select().from(tripRequests).orderBy(desc(tripRequests.createdAt));
    
    // Get all trip request activities with activity details
    const tripsWithActivities = await Promise.all(
      trips.map(async (trip) => {
        // Get activity IDs for this trip
        const tripActivities = await db
          .select({
            activityId: tripRequestActivities.activityId,
            createdAt: tripRequestActivities.createdAt
          })
          .from(tripRequestActivities)
          .where(eq(tripRequestActivities.tripRequestId, trip.id));

        // Get full activity details
        const activityDetails = await Promise.all(
          tripActivities.map(async (ta) => {
            const activity = await db
              .select()
              .from(activities)
              .where(eq(activities.id, ta.activityId))
              .limit(1);
            
            return activity[0] || null;
          })
        );

        return {
          ...trip,
          activities: activityDetails.filter(Boolean) // Remove null activities
        };
      })
    );

    return tripsWithActivities;
  } catch (error) {
    console.error("Error fetching trip requests:", error);
    return [];
  }
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading dashboard data...</p>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const tripData = await getTripRequestsWithActivities();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        totalLeads={tripData.length}
        leadsWithActivities={tripData.filter(t => t.activities.length > 0).length}
      />

      <Suspense fallback={<DashboardLoading />}>
        <AdminDashboard trips={tripData} />
      </Suspense>
    </div>
  );
}