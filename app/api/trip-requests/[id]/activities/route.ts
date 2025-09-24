export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequestActivities, activities, tripRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";

type Params = { id: string };

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id: tripRequestId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const activityId: string | undefined = body?.activityId;

    console.log("POST /api/trip-requests/[id]/activities", { tripRequestId, activityId });

    if (!tripRequestId || !activityId) {
      return NextResponse.json(
        { error: "tripRequestId or activityId missing" },
        { status: 400 }
      );
    }

    // Verify that both the trip request and activity exist
    const [tripExists] = await db
      .select({ id: tripRequests.id })
      .from(tripRequests)
      .where(eq(tripRequests.id, tripRequestId))
      .limit(1);

    if (!tripExists) {
      return NextResponse.json(
        { error: "Trip request not found" },
        { status: 404 }
      );
    }

    const [activityExists] = await db
      .select({ id: activities.id })
      .from(activities)
      .where(and(
        eq(activities.id, activityId),
        eq(activities.isActive, true)
      ))
      .limit(1);

    if (!activityExists) {
      return NextResponse.json(
        { error: "Activity not found or inactive" },
        { status: 404 }
      );
    }

    // Check if the activity is already added to this trip to prevent duplicates
    const [existing] = await db
      .select({ id: tripRequestActivities.id })
      .from(tripRequestActivities)
      .where(
        and(
          eq(tripRequestActivities.tripRequestId, tripRequestId),
          eq(tripRequestActivities.activityId, activityId)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { ok: true, alreadyAdded: true, message: "Activity already added to this trip" },
        { status: 409 }
      );
    }

    // Insert the new trip-activity association
    const [newAssociation] = await db
      .insert(tripRequestActivities)
      .values({ tripRequestId, activityId })
      .returning({ id: tripRequestActivities.id });

    console.log("Successfully added activity to trip:", { 
      associationId: newAssociation.id, 
      tripRequestId, 
      activityId 
    });

    return NextResponse.json({ 
      ok: true, 
      id: newAssociation.id,
      message: "Activity added to trip successfully"
    }, { status: 201 });

  } catch (err) {
    console.error("POST /api/trip-requests/[id]/activities failed:", err);
    
    // Handle unique constraint violation (in case of race conditions)
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return NextResponse.json(
        { ok: true, alreadyAdded: true, message: "Activity already added to this trip" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id: tripRequestId } = await context.params;

    console.log("GET /api/trip-requests/[id]/activities", { tripRequestId });

    if (!tripRequestId) {
      return NextResponse.json(
        { error: "tripRequestId missing" },
        { status: 400 }
      );
    }

    // Get all activities associated with this trip
    const tripActivities = await db
      .select({
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
        addedAt: tripRequestActivities.createdAt,
      })
      .from(tripRequestActivities)
      .innerJoin(
        activities,
        eq(tripRequestActivities.activityId, activities.id)
      )
      .where(eq(tripRequestActivities.tripRequestId, tripRequestId))
      .orderBy(tripRequestActivities.createdAt);

    return NextResponse.json({ 
      ok: true, 
      activities: tripActivities,
      count: tripActivities.length
    });

  } catch (err) {
    console.error("GET /api/trip-requests/[id]/activities failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}