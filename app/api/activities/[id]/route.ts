//app/api/activities/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getActivityById } from "@/lib/db";
import { db } from "@/db/client";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { id: string };

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;

    console.log("GET /api/activities/[id]", { id });

    if (!id) {
      return NextResponse.json(
        { error: "Activity ID missing" },
        { status: 400 }
      );
    }

    const activity = await getActivityById(id);

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      activity 
    });

  } catch (err) {
    console.error("GET /api/activities/[id] failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      price,
      currency,
      reviewCount,
      imageUrl,
      isActive,
    } = body;

    // Update activity
    const updatedActivity = await db
      .update(activities)
      .set({
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: price.toString() }),
        ...(currency && { currency }),
        ...(reviewCount !== undefined && { reviewCount }),
        ...(imageUrl && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();

    if (!updatedActivity || updatedActivity.length === 0) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      activity: updatedActivity[0],
      message: "Activity updated successfully",
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}