// app/api/trip-requests/[id]/route.ts
export const runtime = "edge"; // keep ONLY if your db client supports edge (neon-http, etc.)

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;

  const [row] = await db
    .select()
    .from(tripRequests)
    .where(eq(tripRequests.id, id))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}
