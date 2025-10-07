// app/api/activities/route.ts
export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      destinationId,
      name,
      description,
      price,
      currency,
      reviewCount = 0,
      imageUrl,
    } = body;

    // Validate required fields
    if (!destinationId || !name || !description || !price || !currency || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create activity in database
    const newActivity = await db
      .insert(activities)
      .values({
        destinationId,
        name,
        description,
        price: price.toString(),
        currency,
        reviewCount,
        imageUrl,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        activity: newActivity[0],
        message: "Activity created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}