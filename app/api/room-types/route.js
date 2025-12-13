import { NextResponse } from "next/server";
import { db } from "@/db";
import { room_types } from "@/db/schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: list all room types
export const GET = async () => {
  try {
    const types = await db.select().from(room_types);
    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching room types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST: create room type (ADMIN only)
export const POST = async (request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const newType = await db
      .insert(room_types)
      .values({
        name: body.name,
        maxGuests: body.maxGuests,
        basePriceCents: body.basePriceCents,
      })
      .returning();

    return NextResponse.json(newType[0]);
  } catch (error) {
    console.error("Error creating room type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
