// app/api/trip-requests/list-ids/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequests } from "@/db/schema";

export async function GET() {
  try {
    const trips = await db
      .select({
        id: tripRequests.id,
        destination: tripRequests.destination,
        createdAt: tripRequests.createdAt,
      })
      .from(tripRequests)
      .orderBy(tripRequests.createdAt);

    return NextResponse.json({
      status: "ok",
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Error listing trip request IDs:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}