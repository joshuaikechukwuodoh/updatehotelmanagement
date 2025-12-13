import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms, bookings } from "@/db/schema";
import { and, lt, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const GET = async (request) => {
  try {
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing 'from' or 'to' query params" },
        { status: 400 }
      );
    }

    // Step: Get all rooms
    const allRooms = await db.select().from(rooms);

    // Step: Get bookings that OVERLAP the requested dates
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          lt(bookings.check_in, to), // existing booking starts before requested end
          gt(bookings.check_out, from) // existing booking ends after requested start
        )
      );

    // Step: Extract room IDs that are NOT available
    const unavailableRoomIds = new Set();

    for (let i = 0; i < overlappingBookings.length; i++) {
      const booking = overlappingBookings[i];
      unavailableRoomIds.add(booking.room_id);
    }
    // Step: Filter available rooms
    const availableRooms = [];

    for (let i = 0; i < allRooms.length; i++) {
      const room = allRooms[i];
      if (!unavailableRoomIds.has(room.id)) {
        availableRooms.push(room);
      }
    }

    return NextResponse.json(availableRooms);
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
