import { NextResponse } from "next/server";
import { db } from "@/db"; // your drizzle instance (node-postgres)
import { bookings } from "@/db/schema"; // drizzle table defs
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: list all bookings
export const GET = async () => {
  try {
    const allBookings = await db.select().from(bookings);
    return NextResponse.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST: create booking (ADMIN only)
export const POST = async (request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const allowed = {};
    if (body.guest_id !== undefined) {
      allowed.guest_id = Number(body.guest_id);
    }
    if (body.room_id !== undefined) {
      allowed.room_id = Number(body.room_id);
    }
    if (body.check_in !== undefined) {
      allowed.check_in = body.check_in;
    }
    if (body.check_out !== undefined) {
      allowed.check_out = body.check_out;
    }
    if (body.status !== undefined) {
      allowed.status = body.status;
    }

    const newBooking = await db
      .insert(bookings)
      .values({
        guest_id: allowed.guest_id,
        room_id: allowed.room_id,
        check_in: allowed.check_in,
        check_out: allowed.check_out,
        status: allowed.status,
      })
      .returning();

    return NextResponse.json(newBooking[0]);
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
