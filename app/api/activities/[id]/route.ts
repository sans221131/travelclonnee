//app/api/activities/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getActivityById } from "@/lib/db";

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