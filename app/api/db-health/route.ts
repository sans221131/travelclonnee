// app/api/db-health/route.ts
export const runtime = "nodejs"; // Changed from edge to nodejs for better debugging

import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequests, activities } from "@/db/schema";

export async function GET() {
  try {
    console.log("Database health check starting...");
    
    // Check environment
    const hasEnv = !!process.env.NEON_DATABASE_URL;
    console.log("Environment variable present:", hasEnv);
    
    // Test basic connection with simple query
    const timeResult = await db.execute("select now() as ts");
    console.log("Basic connection test passed");
    
    // Test trip requests table
    let tripRequestCount = 0;
    try {
      const tripResults = await db.select().from(tripRequests);
      tripRequestCount = tripResults.length;
      console.log("Trip requests count:", tripRequestCount);
    } catch (tripError) {
      console.error("Error accessing trip_requests table:", tripError);
    }
    
    // Test activities table
    let activityCount = 0;
    try {
      const activityResults = await db.select().from(activities);
      activityCount = activityResults.length;
      console.log("Activities count:", activityCount);
    } catch (activityError) {
      console.error("Error accessing activities table:", activityError);
    }
    
    return NextResponse.json({
      status: "ok",
      database: {
        environmentConfigured: hasEnv,
        connectionWorking: true,
        totalTripRequests: tripRequestCount,
        totalActivities: activityCount,
      },
      basicQuery: timeResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        environmentConfigured: !!process.env.NEON_DATABASE_URL,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
