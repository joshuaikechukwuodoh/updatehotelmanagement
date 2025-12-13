import { NextResponse } from "next/server";
import { db } from "@/db";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: get a guest by ID
export const GET = async (request, { params }) => {
  try {
    const guestId = Number((await params).id);

    if (Number.isNaN(guestId)) {
      return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
    }

    const [guest] = await db
      .select()
      .from(guests)
      .where(eq(guests.id, guestId));

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Error fetching guest:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PATCH: update guest (ADMIN + RECEPTION)
export const PATCH = async (request, { params }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !["ADMIN", "RECEPTION"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guestId = Number((await params).id);

    if (Number.isNaN(guestId)) {
      return NextResponse.json({ error: "Invalid guest id" }, { status: 400 });
    }

    const body = await request.json();

    // SUPER SIMPLE allowed-object version
    const allowed = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
    };

    // Remove undefined fields
    for (let key in allowed) {
      if (allowed[key] === undefined) {
        delete allowed[key];
      }
    }
    const [updatedGuest] = await db
      .update(guests)
      .set(allowed)
      .where(eq(guests.id, guestId))
      .returning();

    if (!updatedGuest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error("Error updating guest:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
