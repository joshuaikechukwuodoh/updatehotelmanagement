import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const POST = async (request, { params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !["ADMIN", "RECEPTION"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = Number((await params).id);

    if (Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking id" },
        { status: 400 }
      );
    }

    // 1️⃣ Get booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2️⃣ Update booking status → CHECKED_OUT
    const updatedBooking = await db
      .update(bookings)
      .set({ status: "CHECKED_OUT" })
      .where(eq(bookings.id, bookingId))
      .returning();

    // 3️⃣ Room becomes DIRTY (needs cleaning)
    await db
      .update(rooms)
      .set({ status: "DIRTY" })
      .where(eq(rooms.id, booking.room_id));

    return NextResponse.json({
      message: "Guest checked out successfully",
      booking: updatedBooking[0],
    });
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
