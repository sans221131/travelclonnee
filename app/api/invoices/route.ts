export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { invoices } from "@/db/schema";
import { nanoid } from "nanoid";

// Generate a human-readable receipt number like LW-2025-0042
function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `LW-${year}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customer_name,
      customer_email,
      customer_phone,
      amount_in_paise,
      currency = "INR",
      provider = "razorpay",
      provider_short_url,
      notes,
    } = body;

    // Validate required fields
    if (!amount_in_paise || amount_in_paise <= 0) {
      return NextResponse.json(
        { error: "Valid amount_in_paise is required" },
        { status: 400 }
      );
    }

    if (!provider_short_url || provider_short_url.trim() === "") {
      return NextResponse.json(
        { error: "Payment link (provider_short_url) is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(provider_short_url);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format for payment link" },
        { status: 400 }
      );
    }

    // Generate invoice ID and receipt number
    const invoiceId = nanoid(16);
    const receiptNumber = generateReceiptNumber();

    // Create invoice in database
    const newInvoice = await db
      .insert(invoices)
      .values({
        id: invoiceId,
        receipt: receiptNumber,
        customer_name: customer_name || null,
        customer_email: customer_email || null,
        customer_phone: customer_phone || null,
        amount_in_paise,
        currency,
        provider,
        provider_invoice_id: null,
        provider_short_url: provider_short_url || null,
        status: "draft",
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        invoice: newInvoice[0],
        message: "Invoice created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all invoices (optional: add pagination)
    const allInvoices = await db.select().from(invoices);

    return NextResponse.json({
      success: true,
      invoices: allInvoices,
      count: allInvoices.length,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
