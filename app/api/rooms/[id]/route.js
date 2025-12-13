import { NextResponse } from "next/server";
import { db } from "@/db"; // your drizzle instance (node-postgres)
import { rooms } from "@/db/schema"; // drizzle table defs
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Get room by ID
export const GET = async (request, { params }) => {
  try {
    const { id } = await params;
    const roomId = Number(id);
    if (Number.isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// PUT: Update room by ID (Admin only)
export const PUT = async (request, { params }) => {
  try {
    // auth check
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const roomId = Number(id);
    if (Number.isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room id" }, { status: 400 });
    }

    const body = await request.json();

    // Sanitize body to only allowed columns
    const allowed = {};
    if (body.number !== undefined) {
      allowed.number = body.number;
    }
    if (body.floor !== undefined) {
      allowed.floor = Number(body.floor);
    }
    if (body.status !== undefined) {
      allowed.status = body.status;
    }
    if (body.room_type_id !== undefined) {
      allowed.room_type_id = Number(body.room_type_id);
    }

    const result = await db
      .update(rooms)
      .set(allowed)
      .where(eq(rooms.id, roomId))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
