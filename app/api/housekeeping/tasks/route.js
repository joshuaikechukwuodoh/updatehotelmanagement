import { NextResponse } from "next/server";
import { db } from "@/db";
import { housekeeping } from "@/db/schema";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: list ALL housekeeping tasks
export const GET = async () => {
  try {
    const allTasks = await db.select().from(housekeeping);
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error("Error fetching housekeeping tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

// POST: create housekeeping task (ADMIN + RECEPTION)
export const POST = async (request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !["ADMIN", "RECEPTION"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // only these fields allowed
    const allowed = {
      room_id: body.room_id,
      notes: body.notes || "",
      status: "PENDING", // always starts as PENDING
    };

    const newTask = await db.insert(housekeeping).values(allowed).returning();

    return NextResponse.json(newTask[0]);
  } catch (error) {
    console.error("Error creating housekeeping task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
