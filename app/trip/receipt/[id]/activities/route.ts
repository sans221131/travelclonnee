export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequestActivities } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { tripRequestActivities as tripRequestActivitiesTable } from "@/db/schema"; // Ensure correct import

// If db.query is not set up, you may need to use db.select or db directly, depending on your Drizzle setup

type Params = { id: string };

export async function POST(
  req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { id: tripRequestId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const activityId: string | undefined = body?.activityId;

    if (!tripRequestId || !activityId) {
      return NextResponse.json(
        { error: "tripRequestId or activityId missing" },
        { status: 400 }
      );
    }

    // Check existing mapping to avoid unique constraint error spam
    const existing = await db
      .select({ id: tripRequestActivitiesTable.id })
      .from(tripRequestActivitiesTable)
      .where(
        and(
          eq(tripRequestActivitiesTable.tripRequestId, tripRequestId),
          eq(tripRequestActivitiesTable.activityId, activityId)
        )
      )
      .then(rows => rows[0]);

    if (existing) {
      return NextResponse.json(
        { ok: true, alreadyAdded: true },
        { status: 409 }
      );
    }

    const [row] = await db
      .insert(tripRequestActivities)
      .values({ tripRequestId, activityId })
      .returning({ id: tripRequestActivities.id });

    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("POST /trip-requests/[id]/activities failed", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
