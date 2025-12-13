import { NextResponse } from "next/server";
import { db } from "@/db";
import { room_types } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: Get room type by ID
export const GET = async (request, { params }) => {
  try {
    const { id } = await params;
    const roomId = Number(id);
    if (Number.isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(room_types)
      .where(eq(room_types.id, roomId))
      .limit(1);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching room type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const PUT = async (request, { params }) => {
  try {
    const { id } = await params;
    const roomId = Number(id);
    if (Number.isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const body = await request.json();

    // Sanitize body to only allowed columns
    const allowed = {};
    if (body.name !== undefined) {
      allowed.name = body.name;
    }
    if (body.maxGuests !== undefined) {
      allowed.maxGuests = Number(body.maxGuests);
    }
    if (body.basePriceCents !== undefined) {
      allowed.basePriceCents = Number(body.basePriceCents);
    }

    const result = await db
      .update(room_types)
      .set(allowed)
      .where(eq(room_types.id, roomId))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating room type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
