import { NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: list ALL guests
export const GET = async () => {
  try {
    const allGuests = await db.select().from(guests);
    return NextResponse.json(allGuests);
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST: create a guest (ADMIN + RECEPTION)
export const POST = async (request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Only ADMIN and RECEPTION can add guests
    if (!session || !["ADMIN", "RECEPTION"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // SUPER SIMPLE allowed fields
    const allowed = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
    };

    const newGuest = await db.insert(guests).values(allowed).returning();

    return NextResponse.json(newGuest[0]);
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
