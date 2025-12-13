import { NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST: Create room (Admin-only)
export const POST = async (request) => {
  try {
    // Get the user session to check their role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if the user is admin
    if (session && session.user.role === "ADMIN") {
      const body = await request.json();
      const room = await db.insert(rooms).values(body).returning();
      return NextResponse.json(room);
    }

    // If the user is not admin, return unauthorized error
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// GET: List all rooms
export const GET = async (request) => {
  try {
    const allRooms = await db.select().from(rooms);
    return NextResponse.json(allRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
