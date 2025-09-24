// app/api/trip-requests/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequests } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'origin',
      'destination', 
      'nationality',
      'startDate',
      'endDate',
      'adults',
      'airlinePreference',
      'hotelPreference',
      'flightClass',
      'visaStatus',
      'passengerName',
      'email',
      'phoneCountryCode',
      'phoneNumber'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert into database
    const [newTripRequest] = await db.insert(tripRequests).values({
      origin: body.origin,
      destination: body.destination,
      nationality: body.nationality,
      startDate: body.startDate,
      endDate: body.endDate,
      adults: body.adults,
      kids: body.kids || 0,
      airlinePreference: body.airlinePreference,
      hotelPreference: body.hotelPreference,
      flightClass: body.flightClass,
      visaStatus: body.visaStatus,
      passengerName: body.passengerName,
      email: body.email,
      phoneCountryCode: body.phoneCountryCode,
      phoneNumber: body.phoneNumber,
    }).returning();

    return NextResponse.json(newTripRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating trip request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allTripRequests = await db.select().from(tripRequests);
    return NextResponse.json(allTripRequests);
  } catch (error) {
    console.error('Error fetching trip requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = "edge";