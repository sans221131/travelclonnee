// lib/db.ts
import { db } from "@/db/client";
import {
  tripRequests,
  activities,
  tripRequestActivities,
  type Activity as DbActivity,
  type TripRequest as DbTripRequest,
} from "@/db/schema";
import {
  and,
  desc,
  eq,
  inArray,
  not,
  sql,
} from "drizzle-orm";

/* ------------ Types you actually use in the app ------------ */
export type TripRequest = DbTripRequest;
export type Activity = DbActivity;

/* ------------ Database Health Check ------------ */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    console.log("Testing database connection...");
    
    // Simple query to test connection
    const result = await db.select().from(tripRequests).limit(1);
    console.log("Database connection test successful");
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

/* ------------ Trip Requests ------------ */
export async function getTripRequest(id: string): Promise<TripRequest | null> {
  try {
    console.log("getTripRequest called with id:", id);
    
    const [row] = await db
      .select()
      .from(tripRequests)
      .where(eq(tripRequests.id, id))
      .limit(1);

    console.log("getTripRequest result:", row ? "found" : "not found");
    return row || null;
  } catch (error) {
    console.error("Error fetching trip request:", error);
    console.error("Query parameters:", { id });
    
    // More detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return null;
  }
}

/* ------------ Activities (curated for a trip) ------------ */
/**
 * Activities explicitly attached to a trip via the pivot.
 * Only returns active activities.
 */
export async function getSelectedActivitiesForTrip(
  tripId: string
): Promise<Activity[]> {
  try {
    const rows = await db
      .select({
        // select the activity columns only
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
        updatedAt: activities.updatedAt,
      })
      .from(tripRequestActivities)
      .innerJoin(
        activities,
        eq(tripRequestActivities.activityId, activities.id)
      )
      .where(
        and(
          eq(tripRequestActivities.tripRequestId, tripId),
          eq(activities.isActive, true)
        )
      )
      .orderBy(
        desc(activities.reviewCount),
        // NULLs last for price
        sql`CASE WHEN ${activities.price} IS NULL THEN 1 ELSE 0 END`,
        activities.price,
        activities.name
      );

    return rows;
  } catch (error) {
    console.error("Error fetching selected activities:", error);
    return [];
  }
}

/* ------------ Activities (by destination id) ------------ */
/**
 * All active activities for a destination id.
 * Optionally exclude a set of activity ids (to avoid duplicates when mixing curated + suggested).
 */
export async function getActivitiesByDestinationId(
  destinationId: string,
  limit = 24,
  excludeIds: string[] = []
): Promise<Activity[]> {
  console.log("getActivitiesByDestinationId called with:", { destinationId, limit, excludeIds });
  
  const safeLimit = Math.max(1, Math.min(48, limit));
  const conds = [
    eq(activities.destinationId, destinationId),
    eq(activities.isActive, true),
  ];

  if (excludeIds.length) {
    conds.push(not(inArray(activities.id, excludeIds)));
  }

  try {
    const rows = await db
      .select()
      .from(activities)
      .where(and(...conds))
      .orderBy(
        desc(activities.reviewCount),
        sql`CASE WHEN ${activities.price} IS NULL THEN 1 ELSE 0 END`,
        activities.price,
        activities.name
      )
      .limit(safeLimit);

    console.log("getActivitiesByDestinationId result:", { destinationId, rowCount: rows.length });
    return rows;
  } catch (error) {
    console.error("Error fetching activities by destination:", error);
    return [];
  }
}

/* ------------ Activities (smart fetch for the receipt) ------------ */
/**
 * Gets activities for the receipt:
 * 1) Curated activities linked to the trip (via pivot)
 * 2) If you pass destinationId, it fills the rest from that destination (excluding curated)
 *
 * Return shape is convenient for your UI.
 */
export async function getActivitiesForReceipt(
  tripId: string,
  destinationId?: string | null,
  limit = 24
): Promise<{ selected: Activity[]; suggestions: Activity[] }> {
  const allSelected = await getSelectedActivitiesForTrip(tripId);

  // Filter selected activities to only include ones matching the destination
  const selected = destinationId 
    ? allSelected.filter(activity => activity.destinationId === destinationId)
    : allSelected;

  // If there is no destinationId, or you don't want suggestions, just return curated
  if (!destinationId) {
    return { selected, suggestions: [] };
  }

  // Fill suggestions up to `limit` after curated
  const remaining = Math.max(0, limit - selected.length);
  if (remaining <= 0) {
    return { selected, suggestions: [] };
  }

  const excludeIds = selected.map((a) => a.id);
  const suggestions = await getActivitiesByDestinationId(
    destinationId,
    remaining,
    excludeIds
  );

  return { selected, suggestions };
}

/* ------------ Single Activity ------------ */
/**
 * Get a single activity by ID
 */
export async function getActivityById(id: string): Promise<Activity | null> {
  try {
    console.log("getActivityById called with id:", id);
    
    const [activity] = await db
      .select()
      .from(activities)
      .where(and(
        eq(activities.id, id),
        eq(activities.isActive, true)
      ))
      .limit(1);

    console.log("getActivityById result:", activity ? "found" : "not found");
    return activity || null;
  } catch (error) {
    console.error("Error fetching activity by ID:", error);
    console.error("Query parameters:", { id });
    return null;
  }
}
