// app/api/trip-requests/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { tripRequests } from "@/db/schema";

export async function POST(request: Request) {
  try {
    console.log('POST /api/trip-requests - Starting request processing');
    
    const body = await request.json();
    console.log('POST /api/trip-requests - Request body received:', {
      origin: body.origin,
      destination: body.destination,
      passengerName: body.passengerName,
      email: body.email
    });
    
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
        console.error(`POST /api/trip-requests - Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log('POST /api/trip-requests - Validation passed, inserting into database');

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

    console.log('POST /api/trip-requests - Successfully created trip request:', newTripRequest.id);
    return NextResponse.json(newTripRequest, { status: 201 });
  } catch (error) {
    console.error('POST /api/trip-requests - Database error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('POST /api/trip-requests - Error name:', error.name);
      console.error('POST /api/trip-requests - Error message:', error.message);
      console.error('POST /api/trip-requests - Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('GET /api/trip-requests - Fetching all trip requests');
    const allTripRequests = await db.select().from(tripRequests);
    console.log('GET /api/trip-requests - Successfully fetched', allTripRequests.length, 'trip requests');
    return NextResponse.json(allTripRequests);
  } catch (error) {
    console.error('GET /api/trip-requests - Error fetching trip requests:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";