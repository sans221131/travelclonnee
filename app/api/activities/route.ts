// app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');

    if (destinationId) {
      // Get activities for specific destination
      const destinationActivities = await db
        .select()
        .from(activities)
        .where(eq(activities.destinationId, destinationId))
        .orderBy(activities.name);

      return NextResponse.json({
        activities: destinationActivities,
        count: destinationActivities.length
      });
    } else {
      // Get all activities
      const allActivities = await db
        .select()
        .from(activities)
        .orderBy(activities.destinationId, activities.name);

      return NextResponse.json({
        activities: allActivities,
        count: allActivities.length
      });
    }
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}