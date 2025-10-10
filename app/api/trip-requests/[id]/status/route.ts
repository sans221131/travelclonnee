// app/api/trip-requests/[id]/status/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await context.params;

    // Validate status
    const validStatuses = ["new", "contacted", "quoted", "closed", "archived"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update trip status
    const updatedTrip = await db
      .update(tripRequests)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tripRequests.id, id))
      .returning();

    if (updatedTrip.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trip: updatedTrip[0],
    });
  } catch (error) {
    console.error("Error updating trip status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
