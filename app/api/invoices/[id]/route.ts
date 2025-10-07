export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { invoices } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Search by invoice ID or receipt number
    const invoice = await db
      .select()
      .from(invoices)
      .where(or(eq(invoices.id, id), eq(invoices.receipt, id)))
      .limit(1);

    if (!invoice || invoice.length === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: invoice[0],
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const {
      status,
      provider_invoice_id,
      provider_short_url,
      notes,
    } = body;

    // Update invoice
    const updatedInvoice = await db
      .update(invoices)
      .set({
        ...(status && { status }),
        ...(provider_invoice_id && { provider_invoice_id }),
        ...(provider_short_url && { provider_short_url }),
        ...(notes && { notes }),
        updated_at: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    if (!updatedInvoice || updatedInvoice.length === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice[0],
      message: "Invoice updated successfully",
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
