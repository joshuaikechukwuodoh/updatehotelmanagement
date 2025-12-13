import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: cancel booking
export const POST = async (request, { params }) => {
  try {
    // AUTH CHECK
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !["ADMIN", "RECEPTION"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // GET BOOKING ID
    const { id } = await params;
    const bookingId = Number(id);

    if (Number.isNaN(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking id" },
        { status: 400 }
      );
    }

    // CANCEL THE BOOKING
    const result = await db
      .update(bookings)
      .set({ status: "CANCELLED" })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: result[0],
    });
  } catch (error) {
    console.error("Error canceling booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
